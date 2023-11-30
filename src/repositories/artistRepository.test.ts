import { before } from "node:test";
import { DB } from "../db/db";
import { ArtistRepository } from "./artistRepository";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Artist } from "../models/artist";
import { ObjectId } from "bson";
import { faker } from "@faker-js/faker";

let mongoServer: MongoMemoryServer;
let artistRepository: ArtistRepository;

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

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  await mongoServer.start();
  const mongoUri = mongoServer.getUri();
  process.env["MONGODB_URL"] = mongoUri;
  process.env["MONGO_DBNAME"] = "CitricDB";
  await DB.connect();
  artistRepository = new ArtistRepository();
});

afterAll(async () => {
  const client = await DB.getClient();
  client.close(true);
  await mongoServer.stop();
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
});

afterEach(async () => {
  const db = await DB.getDB();
  await db.dropCollection(artistRepository.collectionName);
});

describe("Artist get functions", () => {
  let artists = [] as Artist[];
  beforeAll(async () => {
    for (let i = 0; i < 10; i++) {
      const artist = await artistRepository.createArtist(generateArtist());
      if (artist) {
        artists.push(artist as Artist);
      }
    }
  });

  afterEach(() => {
    artists = [];
  });

  test("should get all artists", async () => {
    const dbArtists = await artistRepository.getArtists();
    expect(dbArtists).toHaveLength(10);
  });
});

describe("Artist create functions", () => {
  test("should create an artist", async () => {
    const artist = generateArtist();
    const dbArtist = await artistRepository.createArtist(artist);
    expect(dbArtist).toEqual(artist);
  });
});
