import { MongoMemoryServer } from "mongodb-memory-server";
import { AccessTokenRepository } from "./accessTokenRepository";
import jwt from "jwt-simple";
import AccessToken from "../models/accessToken";
import { faker } from "@faker-js/faker";
import { ObjectId } from "mongodb";
import { DB } from "../db/db";

let mongoServer: MongoMemoryServer;
let accessTokenRepo: AccessTokenRepository;

function generateAccessToken(): AccessToken {
  const createdAt = faker.date.recent();
  return {
    _id: new ObjectId(faker.database.mongodbObjectId()),
    accessToken: "",
    spotifyAccessToken: faker.string.uuid(),
    createdAt: createdAt,
    updatedAt: new Date(
      createdAt.setDate(
        createdAt.getDate() + faker.number.int({ min: 1, max: 10 })
      )
    ),
    expiresIn: 3600,
    refreshToken: faker.string.uuid(),
  } as AccessToken;
}

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  await mongoServer.start();
  const mongoUri = mongoServer.getUri();
  process.env["MONGODB_URL"] = mongoUri;
  process.env["MONGO_DBNAME"] = "CitricDB";
  await DB.connect();

  accessTokenRepo = new AccessTokenRepository();
});

beforeEach(async () => {
  const db = await DB.getDB();
  if (
    (
      await db
        .listCollections({ name: accessTokenRepo.collectionName })
        .toArray()
    ).length !== 1
  ) {
    await db.createCollection(accessTokenRepo.collectionName);
  }
});

afterEach(async () => {
  const db = await DB.getDB();
  await db.dropCollection(accessTokenRepo.collectionName);
});

afterAll(async () => {
  const client = await DB.getClient();
  client.close(true);
  await mongoServer.stop();
});

describe("AccessToken get functions", () => {
  let accessTokens = [] as AccessToken[];
  beforeEach(async () => {
    for (let i = 0; i < 10; i++) {
      const accessToken = generateAccessToken();
      const token = await accessTokenRepo.createAccessToken(
        accessToken.spotifyAccessToken,
        accessToken.expiresIn,
        accessToken.refreshToken
      );
      if (token) {
        accessToken.accessToken = token as string;
        accessTokens.push(accessToken);
      }
    }
  });

  afterEach(async () => {
    accessTokens = [];
  });

  test("should get an access token by token", async () => {
    const token = await accessTokenRepo.getAccessToken(
      accessTokens[0].accessToken
    );
    expect(token?.accessToken).toEqual(accessTokens[0].accessToken);
    expect(token?.spotifyAccessToken).toEqual(
      accessTokens[0].spotifyAccessToken
    );
    expect(token?.refreshToken).toEqual(accessTokens[0].refreshToken);
  });

  test("should get an access token by refresh token", async () => {
    const token = await accessTokenRepo.getAccessTokenByRefreshToken(
      accessTokens[0].refreshToken
    );
    expect(token?.accessToken).toEqual(accessTokens[0].accessToken);
    expect(token?.spotifyAccessToken).toEqual(
      accessTokens[0].spotifyAccessToken
    );
    expect(token?.refreshToken).toEqual(accessTokens[0].refreshToken);
  });
});

describe("AccessToken create functions", () => {
  test("should create an access token", async () => {
    const accessToken = generateAccessToken();
    const token = await accessTokenRepo.createAccessToken(
      accessToken.spotifyAccessToken,
      accessToken.expiresIn,
      accessToken.refreshToken
    );
    const dbToken = await accessTokenRepo.getAccessToken(token as string);
    expect(dbToken?.spotifyAccessToken).toEqual(accessToken.spotifyAccessToken);
    expect(dbToken?.refreshToken).toEqual(accessToken.refreshToken);
  });
});

describe("AccessToken update functions", () => {
  let accessTokens = [] as AccessToken[];
  beforeAll(async () => {
    for (let i = 0; i < 10; i++) {
      const accessToken = generateAccessToken();
      const token = await accessTokenRepo.createAccessToken(
        accessToken.spotifyAccessToken,
        accessToken.expiresIn,
        accessToken.refreshToken
      );
      if (token) {
        accessToken.accessToken = token as string;
        accessTokens.push(accessToken);
      }
    }
  });

  afterEach(async () => {
    accessTokens = [];
  });

  test("should update an access token", async () => {
    const token = await accessTokenRepo.getAccessToken(
      accessTokens[0].accessToken
    );
    token!.spotifyAccessToken = faker.string.uuid();
    const updatedToken = await accessTokenRepo.updateAccessToken(token!);
    const dbUpdatedToken = await accessTokenRepo.getAccessToken(
      updatedToken as string
    );
    expect(updatedToken).not.toEqual(accessTokens[0].accessToken);
    expect(dbUpdatedToken?.createdAt).toEqual(token!.createdAt);
    expect(dbUpdatedToken?.updatedAt).not.toEqual(token!.updatedAt);
    expect(dbUpdatedToken?.spotifyAccessToken).toEqual(
      token!.spotifyAccessToken
    );
  });
});

describe("AccessToken delete functions", () => {});
