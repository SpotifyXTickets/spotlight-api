/* eslint-disable no-async-promise-executor */
import { Db, MongoClient, ServerApiVersion } from 'mongodb'

export class DB {
  private static client: Promise<MongoClient>
  private static db: Promise<Db>

  public static async connect(): Promise<void> {
    this.db = new Promise<Db>(async (resolve, reject) => {
      try {
        const client = new MongoClient(
          process.env.MONGODB_URL ?? 'mongodb://localhost:27017',
          {
            serverApi: {
              version: ServerApiVersion.v1,
              strict: true,
              deprecationErrors: true,
            },
          },
        )
        this.client = client.connect().then(async (client) => {
          resolve(client.db(process.env.MONGODB_DBNAME ?? 'CitricDB'))
          return client
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  public static async getClient(): Promise<MongoClient> {
    return this.client
  }

  public static async getDB(): Promise<Db> {
    return this.db
  }
}
