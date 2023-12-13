import EventixLogic from './eventixLogic'
import SpotifyLogic from './spotifyLogic'
import { Response, Request } from 'express'

export default class AuthenticationLogic {
  public AuthorizeEventix() {
    const eventixLogic = new EventixLogic()
    eventixLogic.RequestAuthorization()
  }

  public async AuthorizeSpotify(req: Request, res: Response) {
    const spotifyLogic = new SpotifyLogic()
    await spotifyLogic.RequestAuthorization(req, res)
  }

  public async CheckAuthorization(apiKey?: string): Promise<string | boolean> {
    if (!apiKey) {
      return false
    }

    const spotifyLogic = new SpotifyLogic()
    return spotifyLogic.checkAuthorization(apiKey)
  }
}

module.exports = AuthenticationLogic
