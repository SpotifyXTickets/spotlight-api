import { AccessToken } from "./../models/accessToken";
import { MongoClient, ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { AccessTokenRepository } from "./accessTokenRepository";
import crypto from "crypto";
import jwt from "jwt-simple";
import { User } from "../models/user";

let mongoServer: MongoMemoryServer;
let accessTokenRepo: AccessTokenRepository;

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  await mongoServer.start();
  const mongoUri = await mongoServer.getUri();
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db("CitricDB");
  accessTokenRepo = new AccessTokenRepository(db);
});

afterAll(async () => {
  await mongoServer.stop();
});

test("should insert an access token into collection", async () => {
  const token = jwt.encode(
    {
      displayName: "test user",
      spotifyId: 1,
      images: [
        {
          url: "https://i.scdn.co/image/ab67757000003b82b31612cf7ad7a78fe404b561",
          height: 64,
          width: 64,
        },
        {
          url: "https://i.scdn.co/image/ab67757000003b82b31612cf7ad7a78fe404b561",
          height: 300,
          width: 300,
        },
      ],
    },
    "supersecretkey"
  );
  const user = {
    _id: new ObjectId(1),
    display_name: "test user",
    country: "US",
    email: "test@gmail.com",
    images: [
      {
        url: "https://i.scdn.co/image/ab67757000003b82b31612cf7ad7a78fe404b561",
        height: 64,
        width: 64,
      },
      {
        url: "https://i.scdn.co/image/ab67757000003b82b31612cf7ad7a78fe404b561",
        height: 300,
        width: 300,
      },
    ],
  } as User;
  await accessTokenRepo.createAccessToken(
    "iasfjeiojawfiefwefewf",
    3600,
    "iwfehjiofiojweoijfiwej",
    user
  );
  const savedToken = await accessTokenRepo.getAccessToken(token);
  expect(savedToken).toEqual(accessToken);
});

test("should update an access token", async () => {
  const token = jwt.encode(
    {
      displayName: "test user",
      spotifyId: 1,
      createdAt: new Date(),
      images: [
        {
          url: "https://i.scdn.co/image/ab67757000003b82b31612cf7ad7a78fe404b561",
          height: 64,
          width: 64,
        },
        {
          url: "https://i.scdn.co/image/ab67757000003b82b31612cf7ad7a78fe404b561",
          height: 300,
          width: 300,
        },
      ],
    },
    "supersecretkey"
  );
  const user = {
    _id: new ObjectId(1),
    display_name: "test user",
    country: "US",
    email: "test@gmail.com",
    images: [
      {
        url: "https://i.scdn.co/image/ab67757000003b82b31612cf7ad7a78fe404b561",
        height: 64,
        width: 64,
      },
      {
        url: "https://i.scdn.co/image/ab67757000003b82b31612cf7ad7a78fe404b561",
        height: 300,
        width: 300,
      },
    ],
  } as User;
  const accessToken = {
    _id: new ObjectId(1),
    accessToken: token,
    spotifyAccessToken: "aifejiowjfiowjqef",
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresIn: 3600,
    refreshToken: "ijefiowjqoefjoqijif",
  };
  await accessTokenRepo.createAccessToken(
    "aifejiowjfiowjqef",
    3600,
    "ijefiowjqoefjoqijif",
    user
  );
  const savedToken = await accessTokenRepo.getAccessToken(token);
  const secondToken = jwt.encode(
    {
      displayName: "test user",
      spotifyId: 1,
      createdAt: new Date(),
      images: [
        {
          url: "https://i.scdn.co/image/ab67757000003b82b31612cf7ad7a78fe404b561",
          height: 64,
          width: 64,
        },
        {
          url: "https://i.scdn.co/image/ab67757000003b82b31612cf7ad7a78fe404b561",
          height: 300,
          width: 300,
        },
      ],
    },
    "supersecretkey"
  );
  savedToken.accessToken = secondToken;
  await accessTokenRepo.updateAccessToken(savedToken);
  const updatedToken = await accessTokenRepo.getAccessToken(secondToken);
  expect(secondToken).not.toEqual(token);
  expect(updatedToken.accessToken).toEqual(secondToken);
});
