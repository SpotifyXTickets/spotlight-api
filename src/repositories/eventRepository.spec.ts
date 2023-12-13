import { Event } from './../models/event'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { EventRepository } from './eventRepository'
import { faker } from '@faker-js/faker'
import { ObjectId } from 'mongodb'
import { DB } from '../db/db'

describe('EventRepository', () => {
  let mongoMemoryServer: MongoMemoryServer
  let eventRepository: EventRepository

  function generateEvent() {
    const startDate = faker.date.future()
    return {
      _id: new ObjectId(faker.database.mongodbObjectId()),
      ticketMasterId: faker.database.mongodbObjectId(),
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
      postalCode: faker.location.zipCode(),
      locationLat: faker.location.latitude(),
      locationLon: faker.location.longitude(),
      address: faker.location.streetAddress(),
    } as Event
  }
  beforeAll(async () => {
    mongoMemoryServer = new MongoMemoryServer()
    await mongoMemoryServer.start()
    const mongoUri = mongoMemoryServer.getUri()
    process.env['MONGODB_URL'] = mongoUri
    process.env['MONGO_DBNAME'] = 'CitricDB'
    await DB.connect()

    eventRepository = new EventRepository()
  })

  beforeEach(async () => {
    const db = await DB.getDB()
    if (
      (
        await db
          .listCollections({ name: eventRepository.collectionName })
          .toArray()
      ).length !== 1
    ) {
      await db.createCollection(eventRepository.collectionName)
    }
  })

  afterEach(async () => {
    const db = await DB.getDB()
    await db.dropCollection(eventRepository.collectionName)
  })

  afterAll(async () => {
    const client = await DB.getClient()
    client.close(true)
    await mongoMemoryServer.stop()
  })

  describe('getEvents', () => {
    const events = [] as Event[]
    beforeAll(async () => {
      for (let i = 0; i < 10; i++) {
        const event = await eventRepository.createEvent(generateEvent())
        if (event) {
          events.push(event as Event)
        }
      }
    })
    it('should return an array of events', async () => {
      const recievedEvents = await eventRepository.getEvents()
      expect(recievedEvents.length).toEqual(events.length)
    })

    it('should return an empty array if no events exist', async () => {
      const expectedEvents: Event[] = []
      const events = await eventRepository.getEvents()
      expect(events).toEqual(expectedEvents)
    })
  })
})
