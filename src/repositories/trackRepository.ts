import { ObjectId } from 'mongodb'
import Track from '../models/track'
import CoreRepository from '../coreRepository'

export class TrackRepository extends CoreRepository {
  constructor() {
    super('tracks', ['spotifyId'])
  }

  public async getTrack(trackSpotifyId: string): Promise<Track> {
    const data = (await this.collection).findOne({ spotifyId: trackSpotifyId })
    return data as unknown as Track
  }

  public async createTrack(track: Track): Promise<Track | boolean> {
    const collection = await this.collection

    const data = await collection.insertOne(track)

    return data.acknowledged ? track : false
  }

  public async updateTrack(track: Track): Promise<Track | boolean> {
    const collection = await this.collection
    const data = await collection.updateOne({ _id: track._id }, { $set: track })

    return data.acknowledged ? track : false
  }

  public async deleteTrack(trackId: ObjectId): Promise<boolean> {
    const collection = await this.collection
    const data = await collection.deleteOne({ _id: trackId })
    return data.acknowledged
  }
}
