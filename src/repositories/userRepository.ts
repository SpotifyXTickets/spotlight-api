import { ObjectId } from 'mongodb'
import CoreRepository from '../coreRepository'
import { User } from '../models/user'
import 'reflect-metadata'
import { Service } from 'typedi'

@Service()
export class UserRepository extends CoreRepository {
  constructor() {
    super('users')
  }

  public async getUserById(userId: ObjectId): Promise<User | null> {
    const data = await (await this.collection).findOne({ _id: userId })
    return data ? (data as unknown as User) : null
  }

  public async getUserBySpotifyId(spotifyId: string): Promise<User | null> {
    const data = await (await this.collection).findOne({ userId: spotifyId })
    return data ? (data as unknown as User) : null
  }

  public async createUser(user: User): Promise<User | null> {
    const data = await (await this.collection).insertOne(user)
    return data.acknowledged ? user : null
  }

  public async updateUser(user: User): Promise<User | null> {
    const data = await (
      await this.collection
    ).updateOne({ _id: user._id }, { $set: user })
    return data.acknowledged ? user : null
  }

  public async deleteUser(id: ObjectId): Promise<boolean> {
    const data = await (await this.collection).deleteOne({ _id: id })
    return data.acknowledged ? true : false
  }
}
