import { SpotifyPlaylistType } from '../types/spotifyTypes'
import SpotifyLogic from './spotifyLogic'

export class PlaylistLogic {
  private spotifyLogic: SpotifyLogic
  constructor() {
    this.spotifyLogic = new SpotifyLogic()
  }
  async getPlaylists(apiKey: string): Promise<boolean | SpotifyPlaylistType[]> {
    return await this.spotifyLogic.getPlaylists(apiKey)
  }
}
