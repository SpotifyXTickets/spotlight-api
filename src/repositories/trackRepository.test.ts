import { MongoMemoryServer } from "mongodb-memory-server";
import { ArtistRepository } from "./artistRepository";
import { TrackRepository } from "./trackRepository";
import { ObjectId } from "mongodb";
import { faker } from "@faker-js/faker";
import { Artist } from "../models/artist";
import Track from "../models/track";
import { DB } from "../db/db";
import e from "express";

let mongoServer: MongoMemoryServer;
let artistRepository: ArtistRepository;
let trackRepository: TrackRepository;

function generateArtist(): Artist {
  return {
    _id: new ObjectId(faker.database.mongodbObjectId()),
    spotifyId: faker.string.uuid(),
    name: faker.person.fullName(),
    ticketMasterId: faker.string.uuid(),
    imageUrl: faker.image.url(),
    meanScore: faker.number.float({ min: 0, max: 1 }),
    website: faker.internet.url(),
    facebook: faker.internet.url(),
    twitter: faker.internet.url(),
    instagram: faker.internet.url(),
    youtube: faker.internet.url(),
    spotify: faker.internet.url(),
    lastfm: faker.internet.url(),
  } as Artist;
}

function generateTrack(): Track {
  return {
    _id: new ObjectId(faker.database.mongodbObjectId()),
    name: faker.music.songName(),
    accousticness: faker.number.float({ min: 0, max: 1 }),
    danceability: faker.number.float({ min: 0, max: 1 }),
    energy: faker.number.float({ min: 0, max: 1 }),
    instrumentalness: faker.number.float({ min: 0, max: 1 }),
    liveness: faker.number.float({ min: 0, max: 1 }),
    loudness: faker.number.float({ min: -60, max: 0 }),
    speechiness: faker.number.float({ min: 0, max: 1 }),
    tempo: faker.number.float({ min: 0, max: 1 }),
    valence: faker.number.float({ min: 0, max: 1 }),
  } as Track;
}

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  await mongoServer.start();
  const mongoUri = mongoServer.getUri();
  process.env["MONGODB_URL"] = mongoUri;
  process.env["MONGO_DBNAME"] = "CitricDB";
  await DB.connect();

  artistRepository = new ArtistRepository();
  trackRepository = new TrackRepository();
});

beforeEach(async () => {
  const db = await DB.getDB();
  if (
    (
      await db
        .listCollections({ name: artistRepository.collectionName })
        .toArray()
    ).length !== 1
  ) {
    await db.createCollection(artistRepository.collectionName);
  }
  if (
    (
      await db
        .listCollections({ name: trackRepository.collectionName })
        .toArray()
    ).length !== 1
  ) {
    await db.createCollection(trackRepository.collectionName);
  }
});

afterEach(async () => {
  const db = await DB.getDB();
  await db.dropCollection(artistRepository.collectionName);
  await db.dropCollection(trackRepository.collectionName);
});

afterAll(async () => {
  const client = await DB.getClient();
  client.close(true);
  await mongoServer.stop();
});

describe("Artist get functions", () => {
  let artists = [] as Artist[];
  let tracks = [] as Track[];
  let relationTable = [] as Array<{
    artistId: ObjectId;
    trackId: ObjectId;
  }>;
  beforeEach(async () => {
    for (let i = 0; i < 10; i++) {
      const artist = await artistRepository.createArtist(generateArtist());
      if (artist) {
        artists.push(artist as Artist);
      }
    }
    for (let i = 0; i < 100; i++) {
      const artistId = artists[faker.number.int({ min: 0, max: 9 })]._id;
      const track = await trackRepository.createTrackFromArtist(
        generateTrack(),
        artistId
      );
      if (track) {
        relationTable.push({
          artistId,
          trackId: (track as Track)._id,
        });
        tracks.push(track as Track);
      } else {
        console.log("Error!");
      }
    }
  });

  afterEach(() => {
    artists = [];
    tracks = [];
    relationTable = [];
  });

  test("should get all tracks by artistId", async () => {
    const artistId = artists[faker.number.int({ min: 0, max: 9 })]._id;
    const tracks = await trackRepository.getTracksByArtistId(artistId);

    const expectedLength = relationTable.filter((relation) => {
      return relation.artistId === artistId;
    }).length;

    expect(tracks).toHaveLength(expectedLength);
  });

  test("should get track by trackId", async () => {
    const trackId = tracks[faker.number.int({ min: 0, max: 99 })]._id;
    const track = await trackRepository.getTrack(trackId);
    expect(track?._id).toEqual(trackId);
  });
});

describe("Track create functions", () => {
  test("should create an track", async () => {
    const artist = generateArtist();
    const dbArtist = await artistRepository.createArtist(artist);
    expect(dbArtist).toEqual(artist);

    const track = generateTrack();
    const dbTrack = await trackRepository.createTrackFromArtist(
      track,
      (dbArtist as Artist)._id
    );
    expect(dbTrack).toEqual(track);

    const tracks = await trackRepository.getTracksByArtistId(
      (dbArtist as Artist)._id
    );
    expect(tracks).toHaveLength(1);
  });
});

describe("Track update functions", () => {
  let artists = [] as Artist[];
  let tracks = [] as Track[];
  let relationTable = [] as Array<{
    artistId: ObjectId;
    trackId: ObjectId;
  }>;
  beforeEach(async () => {
    for (let i = 0; i < 10; i++) {
      const artist = await artistRepository.createArtist(generateArtist());
      if (artist) {
        artists.push(artist as Artist);
      }
    }
    for (let i = 0; i < 100; i++) {
      const artistId = artists[faker.number.int({ min: 0, max: 9 })]._id;
      const track = await trackRepository.createTrackFromArtist(
        generateTrack(),
        artistId
      );
      if (track) {
        relationTable.push({
          artistId,
          trackId: (track as Track)._id,
        });
        tracks.push(track as Track);
      } else {
        console.log("Error!");
      }
    }
  });

  afterEach(() => {
    artists = [];
    tracks = [];
    relationTable = [];
  });

  test("should update a track", async () => {
    const track = await trackRepository.getTrack(
      tracks[faker.number.int({ min: 0, max: 99 })]._id
    );
    expect(track).not.toBeNull();

    const updatedTrack = {
      ...track,
      name: faker.music.songName(),
      accousticness: faker.number.float({ min: 0, max: 1 }),
      danceability: faker.number.float({ min: 0, max: 1 }),
      energy: faker.number.float({ min: 0, max: 1 }),
      instrumentalness: faker.number.float({ min: 0, max: 1 }),
      liveness: faker.number.float({ min: 0, max: 1 }),
      loudness: faker.number.float({ min: -60, max: 0 }),
    } as Track;
    await trackRepository.updateTrack(updatedTrack);
    const dbTrack = await trackRepository.getTrack(updatedTrack._id);

    expect(dbTrack).toEqual(updatedTrack);
  });
});
