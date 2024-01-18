import { ObjectId } from 'bson'
import { EmbeddedArtist } from '../models/artist'
import CoreRepository from '../coreRepository'

export class ArtistRepository extends CoreRepository {
  constructor() {
    super('artists', ['spotifyId', 'ticketMasterId'])
  }

  public async getArtists(): Promise<EmbeddedArtist[]> {
    const data = await (await this.collection).find({}).toArray()
    return data as unknown as EmbeddedArtist[]
  }

  public async getArtistById(id: ObjectId): Promise<EmbeddedArtist | boolean> {
    const data = await (await this.collection).findOne({ _id: id })
    return data ? (data as unknown as EmbeddedArtist) : false
  }

  public async getArtistBySpotifyId(
    spotifyId: string,
  ): Promise<EmbeddedArtist | boolean> {
    const data = await (await this.collection).findOne({ spotifyId: spotifyId })
    return data ? (data as unknown as EmbeddedArtist) : false
  }

  public async getArtistsBySpotifyIds(
    spotifyIds: string[],
  ): Promise<EmbeddedArtist[]> {
    const data = (await this.collection).find({
      spotifyId: { $in: spotifyIds },
    })

    const artists = await data.toArray()
    if (artists.length === 0) {
      return []
    }

    return artists as unknown as EmbeddedArtist[]
  }

  public async createArtist(
    artist: EmbeddedArtist,
  ): Promise<EmbeddedArtist | boolean> {
    try {
      const data = await (await this.collection).insertOne(artist)
      return data.acknowledged ? artist : false
    } catch (err) {
      return false
    }
  }

  public async updateArtist(
    artist: EmbeddedArtist,
  ): Promise<EmbeddedArtist | boolean> {
    try {
      const filter = { spotifyId: artist.spotifyId }
      const update = { $set: artist }
      const data = await (await this.collection).updateOne(filter, update)
      return data.modifiedCount ? artist : false
    } catch (err) {
      return false
    }
  }
}
