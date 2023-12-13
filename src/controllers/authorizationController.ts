import { AppController } from './appController'
import { Response, Request, NextFunction } from 'express'
import SpotifyLogic from '../logics/spotifyLogic'
import logger from '../logger'

export default class AuthorizationController extends AppController {
  constructor() {
    super()
    // uses the function in the baseclass to generate routes for the router.
    this.setRoutes([
      {
        uri: '/spotify',
        method: this.authorizeSpotify,
      },
    ])
  }

  public async authorizeSpotify(req: Request, res: Response): Promise<void> {
    const spotifyLogic = new SpotifyLogic()
    const redirectUrl = req.headers.referer ? req.headers.referer : undefined

    const tokenResponse = await spotifyLogic.RequestAccessToken(
      req.query.code as string,
      req.query.state as string,
      redirectUrl,
    )
    const requestOrigin = req.headers.origin
    if (tokenResponse.error !== null) res.status(400).send(tokenResponse.error)

    res.status(200).send({
      accessToken: tokenResponse.accessToken,
    })
    return
  }
}

module.exports = AuthorizationController
