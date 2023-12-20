import { EventRepository } from './../repositories/eventRepository'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { importTMEvents } from './importEvents'
import { DB } from '../db/db'

let mongoMemoryServer: MongoMemoryServer
beforeAll(async () => {
  mongoMemoryServer = new MongoMemoryServer()
  await mongoMemoryServer.start()
  const mongoUri = mongoMemoryServer.getUri()
  process.env['MONGODB_URL'] = mongoUri
  process.env['MONGODB_COLLECTION_DB'] = 'CitricDBV2'
  await DB.connect()
})

beforeEach(async () => {
  const db = await DB.getDB()
  if ((await db.listCollections({ name: 'events' }).toArray()).length !== 1) {
    await db.createCollection('events')
  }
})

afterEach(async () => {
  const db = await DB.getDB()
  await db.dropCollection('events')
})

afterAll(async () => {
  const client = await DB.getClient()
  client.close(true)
  await mongoMemoryServer.stop()
})

describe('importTMEvents', () => {
  it('should import TicketMaster events', async () => {
    // Mock the necessary dependencies and setup test data
    const apiKey = 'your-api-key'
    // ...
    const eventRepository = new EventRepository()
    // Call the function being tested
    await importTMEvents(apiKey)

    const events = await eventRepository.getEvents()

    expect(events.length).toBeGreaterThan(0)

    // Assert the expected behavior or side effects
    // ...
  })
})
