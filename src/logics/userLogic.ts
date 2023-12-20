import { UserRepository } from './../repositories/userRepository'
import { User } from '../models/user'
import { ErrorType } from '../types/errorType'
import SpotifyLogic from './spotifyLogic'

export class UserLogic {
  private spotifyLogic: SpotifyLogic
  private userRepository: UserRepository

  constructor() {
    this.spotifyLogic = new SpotifyLogic()
    this.userRepository = new UserRepository()
  }

  async addUser(user: User): Promise<User | ErrorType> {
    // Add add account logic here
    return (
      (await this.userRepository.createUser(user)) ??
      ({
        status: 500,
        message: 'Could not create user',
        statusText: 'Internal Server Error',
      } as ErrorType)
    )
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
