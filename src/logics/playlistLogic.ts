import Container, { Service } from 'typedi'
import { SpotifyPlaylistType } from '../types/spotifyTypes'
import SpotifyLogic from './spotifyLogic'
import 'reflect-metadata'

@Service()
export class PlaylistLogic {
  private spotifyLogic: SpotifyLogic
  constructor() {
    this.spotifyLogic = Container.get(SpotifyLogic)
  }
  async getPlaylists(apiKey: string): Promise<boolean | SpotifyPlaylistType[]> {
    return await this.spotifyLogic.getPlaylists(apiKey)
  }
}
