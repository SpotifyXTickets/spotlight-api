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

  public CheckAuthorization(req: Request, res: Response) {
    const authorization = req.headers.authorization
    if (authorization === undefined) {
      return false
    }
    const spotifyLogic = new SpotifyLogic()
    return spotifyLogic.checkAuthorization(authorization.split(' ')[1])
  }
}

module.exports = AuthenticationLogic
