import { EventRepository } from "./../repositories/eventRepository";
import express, { Application, Request, Response } from "express";
import { DB } from "../db/db";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import SpotifyLogic from "../logics/spotifyLogic";
import { Collection, Db, ObjectId } from "mongodb";
import { Server } from "http";
import TicketMasterLogic from "../logics/ticketMasterLogic";
import { Event } from "../models/event";
import { ArtistRepository } from "../repositories/artistRepository";
import spotify from "../docs/spotify";
import { AccessTokenRepository } from "../repositories/accessTokenRepository";
import { Artist } from "../models/artist";
import {
  TicketMasterArtistType,
  TicketMasterEventResponse,
  TicketMasterEventType,
} from "../types/ticketMasterTypes";
import { TrackRepository } from "../repositories/trackRepository";
import Track from "../models/track";
import { SpotifyTopTrackType } from "../types/spotifyTypes";

dotenv.config();
const obtainRefreshToken = async (backendTokenCollection: Collection) => {
  const spotifyLogic = new SpotifyLogic();
  const token = await backendTokenCollection.findOne({});
  if (token === null) {
    console.error("No token present");
    process.exit(1);
  }
  const tokenResponse = await spotifyLogic.RefreshAuthorization({
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
  });
  await backendTokenCollection.updateOne(
    {},
    {
      $set: {
        accessToken: tokenResponse,
        refreshToken: token.refreshToken,
      },
    }
  );
  return tokenResponse;
};
const startProcessing = async (db: Db, spotifyLogic: SpotifyLogic) => {
  console.log("Refreshing token....");
  const tokenResponse = await obtainRefreshToken(
    db.collection("backendTokens")
  );
  console.log("Token refreshed!");

  const accessTokenRepository = new AccessTokenRepository();
  const accessToken = (
    await accessTokenRepository.getAccessToken(tokenResponse as string)
  )?.spotifyAccessToken as string;

  await spotifyLogic.getPlaylists(tokenResponse as string);
  if (!tokenResponse) {
    console.error("Error obtaining refresh token");
    process.exit(1);
  }
  const ticketMasterLogic = new TicketMasterLogic();
  const eventRepository = new EventRepository();
  const artistRepository = new ArtistRepository();
  const trackRepository = new TrackRepository();
  const eventResponse = await ticketMasterLogic.getAllEvents(200);
  const { links, events } = eventResponse as {
    events: TicketMasterEventType[];
    links: TicketMasterEventResponse["_links"];
  };

  const importEvents = async (
    events: TicketMasterEventType[]
  ): Promise<Array<Event & { artists: TicketMasterArtistType[] }>> => {
    const eventPromises = events.map(async (ticketEvent) => {
      if (ticketEvent._embedded.venues[0].address === undefined) {
        console.log("No address found");
        return {};
      }
      const event = {
        ticketMasterId: ticketEvent.id,
        name: ticketEvent.name,
        imageUrl: ticketEvent.images[0].url,
        meanScore: 0, // TODO: Calculate mean score
        ...(ticketEvent.dates.start
          ? { startDate: new Date(ticketEvent.dates.start.dateTime) }
          : {}),
        ...(ticketEvent.dates.end
          ? { endDate: new Date(ticketEvent.dates.end.dateTime) }
          : {}),
        city: ticketEvent._embedded.venues[0].city.name,
        country: ticketEvent._embedded.venues[0].country.name,
        address: ticketEvent._embedded.venues[0].address.line1,
        postalCode: ticketEvent._embedded.venues[0].postalCode,
        ticketLink: ticketEvent.url,
        description: ticketEvent.description ?? "",
        locationLon: ticketEvent._embedded.venues[0].location.longitude,
        locationLat: ticketEvent._embedded.venues[0].location.latitude,
      } as Event;
      return new Promise<
        (Event & { artists: TicketMasterArtistType[] }) | void
      >(async (resolve, reject) => {
        let dbEvent = await eventRepository.getEventByTicketMasterId(
          ticketEvent.id
        );
        if (ticketEvent._embedded.attractions === undefined) {
          resolve();
          return;
        }
        if (ticketEvent._embedded.attractions.length < 1) {
          resolve();
          return;
        }

        if (!dbEvent) {
          dbEvent = await eventRepository.createEvent(event);
        }
        const spotifyArtistIds = ticketEvent._embedded.attractions
          .map((attraction) => {
            try {
              const spotifyArtistId = attraction.externalLinks
                .spotify![0].url.split("/")[4]
                .split("?")[0];
              return spotifyArtistId;
            } catch (e) {
              return;
            }
          })
          .filter((spotifyArtistId) => spotifyArtistId !== undefined);
        spotifyArtistIds.forEach(async (spotifyArtistId) => {
          await eventRepository.linkEventToArtist(
            dbEvent as Event,
            spotifyArtistId as string
          );
        });
        resolve({
          ...(dbEvent as Event),
          artists: ticketEvent._embedded
            .attractions as TicketMasterArtistType[],
        });
      });
    }) as Promise<
      Event & {
        artists: TicketMasterArtistType[];
      }
    >[];
    // console.log(eventPromises.length);
    const eventPromisesResolved = (await Promise.all(eventPromises)).filter(
      (event) => event !== undefined
    ) as (Event & { artists: TicketMasterArtistType[] })[];

    return eventPromisesResolved;
  };

  const importArtists = async (
    ticketMasterArtists: TicketMasterArtistType[]
  ): Promise<Artist[]> => {
    if (ticketMasterArtists.length > 50) {
      console.error("Too many artists");
      process.exit(1);
    }

    const ticketMasterArtistsWithSpotifyId = ticketMasterArtists
      .map((artist) => {
        try {
          return {
            tm: artist,
            ticketMastersSpotifyId: artist
              .externalLinks!.spotify![0].url.split("/")[4]
              .split("?")[0],
          };
        } catch (err) {
          return;
        }
      })
      .filter((artist) => artist !== undefined) as Array<{
      tm: TicketMasterArtistType;
      ticketMastersSpotifyId: string;
    }>;
    const artistResponse = (
      await spotifyLogic.getArtistsByIds(
        accessToken,
        ticketMasterArtistsWithSpotifyId.map(
          (artist) => artist.ticketMastersSpotifyId
        )
      )
    ).map((artist) => {
      if (artist === null) {
        console.log("Artist undefined");
      }
      const relatedTicketMasterArtist = ticketMasterArtistsWithSpotifyId.find(
        (artistWithSpotifyId) =>
          artistWithSpotifyId.ticketMastersSpotifyId === artist.id
      );
      return new Artist(
        artist,
        relatedTicketMasterArtist ? relatedTicketMasterArtist.tm : undefined
      );
    });

    const artistPromises = artistResponse.map(async (artist) => {
      return new Promise<Artist>(async (resolve, reject) => {
        const a = await artistRepository.createArtist(artist);
        if (!a) {
          reject("Failed to create artist");
          return;
        }
        resolve(a as Artist);
        return;
      }).catch((err) => {
        return;
      });
    });

    await Promise.all(artistPromises);

    return artistResponse;
  };
  const searchParams = new URLSearchParams(links.last.href.split("?")[1]);
  const lastPage = parseInt(searchParams.get("page") as string);

  const eventCalls: Promise<
    Array<Event & { artists: TicketMasterArtistType[] }>
  >[] = [];

  for (let i = 1; i < lastPage; i++) {
    if (i % 5 === 0) {
      console.log("Waiting 1 second to prevent rate limiting");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const eventResponse = await ticketMasterLogic.getAllEvents(200, i);
    if (eventResponse === undefined) {
      console.error(
        `Error obtaining events ${i}th page for some unknown reason`
      );
      console.error("Skipping page");
      continue;
    }
    const { events } = eventResponse as {
      events: TicketMasterEventType[];
      links: TicketMasterEventResponse["_links"];
    };
    eventCalls.push(importEvents(events));
  }
  eventCalls.push(importEvents(events));

  const eventData = (await Promise.all(eventCalls)).flat();

  const ticketMasterArtists = [
    ...new Set(
      eventData
        .filter((event) => event.artists !== undefined)
        .map((event) => event.artists)
        .flat()
        .filter(
          (artist) =>
            artist.externalLinks !== undefined &&
            artist.externalLinks.spotify !== undefined
        )
    ),
  ];
  console.log("Events imported!");

  const artistCalls: Promise<Artist[]>[] = [];

  while (ticketMasterArtists.length > 0) {
    const ticketMasterArtistsChunk = ticketMasterArtists.splice(0, 50);
    artistCalls.push(
      new Promise<Artist[]>((resolve, reject) => {
        importArtists(ticketMasterArtistsChunk).then((artists) => {
          resolve(artists);
        });
      })
    );
  }

  const artistData = (await Promise.all(artistCalls)).flat();
  const trackCalls: Promise<SpotifyTopTrackType[]>[] = [];

  while (artistData.length > 0) {
    const artistDataChunk = artistData.splice(0, 20);
    artistDataChunk.forEach(async (artist) => {
      trackCalls.push(
        new Promise(async (resolve, reject) => {
          const tracks = (await spotifyLogic.getTopTracksOfArtist(
            accessToken,
            artist.spotifyId as string
          )) as SpotifyTopTrackType[];

          resolve(tracks);
        })
      );
    });
    console.log("Waiting 1 second to prevent rate limiting");
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const trackData = (await Promise.all(trackCalls)).flat();
  const acousticCalls: Promise<any[]>[] = [];

  while (trackData.length > 0) {
    const trackDataChunk = trackData.splice(0, 100);
    acousticCalls.push(
      new Promise(async (resolve, reject) => {
        const tracks = await spotifyLogic.getTracksAudioFeatures(
          accessToken,
          trackDataChunk.map((track) => track.id)
        );

        tracks.forEach(async (track) => {
          try {
            const dbTrack = await trackRepository.getTrack(track.id);
            if (dbTrack) {
              return;
            }
            const originalTrack = trackDataChunk.find(
              (trackData) => trackData.id === track.id
            ) as SpotifyTopTrackType;
            const fullTrack = new Track(originalTrack, track);
            await trackRepository.createTrack(fullTrack);
            originalTrack.artists.forEach(async (artist) => {
              await trackRepository.linkTracktoArtist(
                fullTrack,
                artist.id as string
              );
            });
          } catch (e) {
            return;
          }
        });
        resolve(tracks);
      })
    );
    // trackDataChunk.forEach(async (track) => {
    //   await trackRepository.createTrack(new Track(track));
    // });
    console.log("Waiting 1 second to prevent rate limiting");
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const acousticData = (await Promise.all(acousticCalls)).flat();

  console.log("Artists imported!");
};

const demo = (module.exports.demo = async function () {
  await DB.connect();
  console.log("Connected to DB");

  const db = await DB.getDB();
  const collectionTokens = db.collection("backendTokens");
  const spotifyLogic = new SpotifyLogic();
  // Checking if token is already present.
  const token = await collectionTokens.findOne({});

  if (token === null) {
    let server: Server | boolean = false;
    // When token not present we will first host an express listen till code obtained from user executing command.
    console.log("Hosting temporary server to obtain token....");
    const app: Application = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get("/authorize", async (req: Request, res: Response) => {
      const code = req.query.code;
      const state = req.query.state;
      if (code && state) {
        const tokenResponse = await spotifyLogic.RequestAccessToken(
          code as string,
          state as string,
          "http://localhost:5000/authorize"
        );

        if (tokenResponse.error !== null) {
          console.error(tokenResponse.error);
          res.status(400).send(tokenResponse.error);
          (server as Server).close();
          process.exit(1);
          return;
        }
        await db.collection("backendTokens").insertOne({
          accessToken: tokenResponse.accessToken,
          expiresIn: tokenResponse.expiresIn,
          refreshToken: tokenResponse.refreshToken,
        });
        console.log("Token obtained!");
        app.removeAllListeners();
        console.log("Stopped temporary server to obtain token....");
        res.send("Token obtained!");
        (server as Server).close();
        await startProcessing(db, spotifyLogic);

        return;
      } else {
        await spotifyLogic.RequestAuthorization(
          req,
          res,
          "http://localhost:5000/authorize"
        );
        return;
      }
    });

    server = app.listen(5000, () => {
      console.log("Temporary accessToken url http://localhost:5000/authorize");
    });
    return;
  }
  // When token is present we will refresh the token and update the database.
  await startProcessing(db, spotifyLogic);
  process.exit(1);
});

(async () => {
  try {
    await demo();
  } catch (error) {
    console.error(error);
  }
})();
