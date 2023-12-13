import { User } from '../models/user'
import { ErrorType } from '../types/errorType'
import SpotifyLogic from './spotifyLogic'

export class UserLogic {
  private spotifyLogic: SpotifyLogic

  constructor() {
    this.spotifyLogic = new SpotifyLogic()
  }

  async deleteUser(userId: string): Promise<void | ErrorType> {
    // Add delete account logic here
  }

  async logoutAccount(apiKey: string): Promise<void | ErrorType> {
    // Add logout account logic here
  }

  async getUser(apiKey: string): Promise<{ user: User } | ErrorType> {
    return this.spotifyLogic.getUser(apiKey)
    // Add get user logic here
  }
}
