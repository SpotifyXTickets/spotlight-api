import { ObjectId } from 'bson'
import Artist from '../models/artist'
import { ArtistRepository } from '../repositories/artistRepository'
import SpotifyLogic from './spotifyLogic'
import 'reflect-metadata'
import Container, { Service } from 'typedi'

@Service()
export class ArtistLogic {
  private artistRepository: ArtistRepository
  private spotifyLogic: SpotifyLogic

  constructor() {
    this.artistRepository = Container.get(ArtistRepository)
    this.spotifyLogic = Container.get(SpotifyLogic)
  }

  public async getArtists(): Promise<Artist[]> {
    return await this.artistRepository.getArtists()
  }

  public async getArtistById(id: string): Promise<Artist | null> {
    const artist = await this.artistRepository.getArtistById(new ObjectId(id))
    if (!artist) {
      return null
    }

    return artist as Artist
  }

  public async getArtistBySpotifyId(spotifyId: string): Promise<Artist | null> {
    const artist = await this.artistRepository.getArtistBySpotifyId(spotifyId)
    if (!artist) {
      return null
    }

    return artist as Artist
  }
}
