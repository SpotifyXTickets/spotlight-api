/* eslint-disable no-async-promise-executor */
import { Db, MongoClient, ServerApiVersion } from 'mongodb'

export class DB {
  private static client: Promise<MongoClient>
  private static db: Promise<Db>

  public static async disconnect(): Promise<void> {
    await this.client.then((client) => client.close())
  }

  public static async connect(): Promise<boolean> {
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
          resolve(client.db(process.env.MONGODB_COLLECTION_DB ?? 'CitricDB'))
          return client
        })
      } catch (e) {
        reject(e)
      }
    })

    const connectionResult = new Promise<boolean>(async (resolve, reject) => {
      try {
        await this.db
        await this.client
        resolve(true)
      } catch (e) {
        reject(e)
      }
    })

    return connectionResult
  }

  public static async getClient(): Promise<MongoClient> {
    if (this.client === undefined) await this.connect()
    return this.client
  }

  public static async getDB(): Promise<Db> {
    if (this.db === undefined) await this.connect()
    return this.db
  }
}
