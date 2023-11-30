import { TrackRepository } from "./../repositories/trackRepository";
import { EventRepository } from "./../repositories/eventRepository";
import { ArtistRepository } from "./../repositories/artistRepository";
import RecommendationsLogic from "../logics/recommendationsLogic";
import dotenv from "dotenv";
import { DB } from "../db/db";
import Artist from "../models/artist";
import Track from "../models/track";

dotenv.config();
DB.connect();
console.log("Connected to DB");
const recreateMeanScores = (module.exports.recreateMeanScore =
  async function () {
    const recommendationsLogic = new RecommendationsLogic();
    const artistRepository = new ArtistRepository();
    const eventRepository = new EventRepository();
    const trackRepository = new TrackRepository();

    console.log("Getting events");
    const promise = new Promise<void>(async (resolve, reject) => {
      // const events = await eventRepository.getEvents();
      // const artistCalls: Promise<Artist[]>[] = [];

      // events.forEach(async (event) => {
      //   artistCalls.push(artistRepository.getArtistsByEvent(event));
      // });

      // console.log("got events");

      // const artists = [...new Set((await Promise.all(artistCalls)).flat())];

      // console.log("got artists");
      // for (let i = 0; i < artists.length; i++) {
      //   const artist = artists[i];
      // const tracks = await trackRepository.getTracksByArtistId(
      //   artist.spotifyId as string
      // );
      // const meanScore = recommendationsLogic.generateMeanScore(tracks);
      // console.log(meanScore);
      // }

      // console.log("Created artists mean scores");

      // artists.forEach(async (artist) => {
      //   const tracks = await trackRepository.getTracksByArtistId(
      //     artist.spotifyId as string
      //   );
      //   const meanScore = recommendationsLogic.generateMeanScore(tracks);
      //   console.log(meanScore);
      // });

      await eventRepository.getEvents().then(async (events) => {
        const artistCalls: Promise<Artist[]>[] = [];

        events.forEach(async (event) => {
          console.log("Getting artists");
          artistCalls.push(
            new Promise<Artist[]>(async (resolve, reject) => {
              const artists = await artistRepository.getArtistsByEvent(event);
              const updatedArtists: Artist[] = [];

              for (let i = 0; i < artists.length; i++) {
                const artist = artists[i];
                const tracks = await trackRepository.getTracksByArtistId(
                  artist.spotifyId as string
                );
                const meanScore =
                  recommendationsLogic.generateMeanScore(tracks);

                artist.meanScore = meanScore;
                await artistRepository.updateArtist(artist);
                updatedArtists.push(artist);
              }

              const artistScores = updatedArtists.map((artist) => {
                return artist.meanScore;
              });
              let artistSum = 0;

              for (let i = 0; i < artistScores.length; i++) {
                const score = artistScores[i];
                artistSum += score;
              }

              if (Number.isNaN((artistSum / artistScores.length) as number)) {
                {
                  event.meanScore = 0;
                }
              } else {
                event.meanScore = artistSum / artistScores.length;
              }
              await eventRepository.updateEvent(event);

              resolve(updatedArtists);
            })
          );
        });

        await Promise.all(artistCalls);
      });
      resolve();
    });

    await promise;

    process.exit(0);
  });

(async () => {
  try {
    await recreateMeanScores();
  } catch (error) {
    console.log(error);
  }
})();
