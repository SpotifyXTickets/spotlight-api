/* eslint-disable no-async-promise-executor */
import { Db, Collection } from 'mongodb'
import { DB } from '../db/db'

export abstract class CoreRepository {
  protected db: Promise<Db>
  protected collection: Promise<Collection>
  public collectionName: string

  constructor(collectionName: string, uniqueIndexes?: string[]) {
    this.db = DB.getDB()
    this.collectionName = collectionName
    this.collection = new Promise<Collection>(async (resolve, reject) => {
      try {
        const db = await this.db

        const primaryCollection = db.collection(collectionName)
        if (uniqueIndexes) {
          uniqueIndexes.forEach(async (index) => {
            await primaryCollection.createIndex(index, { unique: true })
          })
        }
        resolve(primaryCollection)
      } catch (e) {
        reject(e)
      }
    })
  }

  // Add your methods for communicating with MongoDB here
}

export default CoreRepository
