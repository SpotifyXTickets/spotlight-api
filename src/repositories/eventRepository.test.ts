import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jwt-simple";
import { EventRepository } from "./eventRepository";
import { Event } from "../models/event";
import { ObjectId } from "bson";
import { DB } from "../db/db";
import { faker } from "@faker-js/faker";

let mongoServer: MongoMemoryServer;
let eventRepository: EventRepository;

function generateEvent() {
  const startDate = faker.date.future();
  return {
    _id: new ObjectId(faker.database.mongodbObjectId()),
    meanScore: faker.number.float({ min: 0, max: 1 }),
    name: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    startDate: startDate,
    endDate: new Date(startDate.setDate(startDate.getDate() + 1)),
    ticketLink: faker.internet.url(),
    imageUrl: faker.image.url(),
    city: faker.location.city(),
    state: faker.location.state(),
    country: faker.location.country(),
    locationLat: faker.location.latitude(),
    locationLon: faker.location.longitude(),
    address: faker.location.streetAddress(),
  } as Event;
}

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  await mongoServer.start();
  const mongoUri = mongoServer.getUri();
  process.env["MONGODB_URL"] = mongoUri;
  process.env["MONGO_DBNAME"] = "CitricDB";
  await DB.connect();

  eventRepository = new EventRepository();
});

beforeEach(async () => {
  const db = await DB.getDB();
  if (
    (
      await db
        .listCollections({ name: eventRepository.collectionName })
        .toArray()
    ).length !== 1
  ) {
    await db.createCollection(eventRepository.collectionName);
  }
});

afterEach(async () => {
  const db = await DB.getDB();
  await db.dropCollection(eventRepository.collectionName);
});

afterAll(async () => {
  const client = await DB.getClient();
  client.close(true);
  await mongoServer.stop();
});

describe("Event get functions", () => {
  const events = [] as Event[];
  beforeAll(async () => {
    for (let i = 0; i < 10; i++) {
      const event = await eventRepository.createEvent(generateEvent());
      if (event) {
        events.push(event as Event);
      }
    }
  });

  test("should get all events", async () => {
    const dbEvents = await eventRepository.getEvents();
    expect(dbEvents).toHaveLength(10);
  });
});

describe("Event create functions", () => {
  test("should create an event", async () => {
    const event = generateEvent();
    const dbEvent = await eventRepository.createEvent(event);
    expect(dbEvent).toEqual(event);
  });
});

describe("Event update functions", () => {
  // const events = [] as Event[];
  // beforeAll(async () => {
  //   for (let i = 0; i < 10; i++) {
  //     const event = await eventRepository.createEvent(generateEvent());
  //     if (event) {
  //       events.push(event as Event);
  //     }
  //   }
  // });
});

describe("Event delete functions", () => {
  // const events = [] as Event[];
  // beforeAll(async () => {
  //   for (let i = 0; i < 10; i++) {
  //     const event = await eventRepository.createEvent(generateEvent());
  //     if (event) {
  //       events.push(event as Event);
  //     }
  //   }
  // });
});
