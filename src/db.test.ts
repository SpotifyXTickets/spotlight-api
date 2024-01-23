import { MongoMemoryServer } from 'mongodb-memory-server'
import { DB } from './db'

describe('DB', () => {
  beforeAll(async () => {
    const mongoServer = new MongoMemoryServer()
    await mongoServer.start()
    const mongoUri = mongoServer.getUri()
    process.env.MONGODB_URL = mongoUri
    process.env.MONGODB_DBNAME = 'test'
  })

  afterAll(async () => {
    await DB.disconnect()
  })

  it('should connect to the database', async () => {
    const attempt = DB.connect()
    expect(attempt).toBeInstanceOf(Promise)
    expect(attempt).resolves.toBeTruthy()
    await attempt

    await DB.disconnect()
  })
})
