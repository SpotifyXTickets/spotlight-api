import { Collection, Db } from 'mongodb'
import { CoreRepository } from './coreRepository'
import { Document } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { DB } from './db'

class TestRepository extends CoreRepository {
  constructor(collectionName: string) {
    super(collectionName)
  }

  getCollection() {
    return this.collection
  }

  getDB() {
    return this.db
  }
}
describe('CoreRepository', () => {
  let testRepository: TestRepository
  let mongoServer: MongoMemoryServer

  beforeAll(async () => {
    mongoServer = new MongoMemoryServer()
    await mongoServer.start()
    const mongoUri = mongoServer.getUri()
    process.env.MONGODB_URL = mongoUri
    process.env.MONGODB_DBNAME = 'test'
    await DB.connect()
  })

  afterAll(async () => {
    await DB.disconnect()
    await mongoServer.stop()
  })

  beforeEach(() => {
    testRepository = new TestRepository('testCollection')
  })

  it('should create a new instance of CoreRepository', async () => {
    expect(testRepository).toBeInstanceOf(CoreRepository)
    expect(testRepository).toBeInstanceOf(TestRepository)

    const collection = await testRepository.getCollection()
    const db = await testRepository.getDB()

    expect(collection).toBeInstanceOf(Collection<Document>)
    expect(db).toBeInstanceOf(Db)

    expect(testRepository.collectionName).toBe('testCollection')
  })

  // Add more test cases for your CoreRepository methods here
})
