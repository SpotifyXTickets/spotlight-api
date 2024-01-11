import { AppController } from './appController'
import { Response, Request } from 'express'
import SpotifyLogic from '../logics/spotifyLogic'

/**
 * @swagger
 * tags:
 *   name: Authorization
 *   description: API operations for authorization
 */

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

  /**
   * @swagger
   * /authorization/spotify:
   *   get:
   *     summary: Authorize Spotify.
   *     description: Initiates the Spotify authorization process.
   *     tags: [Authorization]
   *     parameters:
   *       - in: query
   *         name: code
   *         required: true
   *         description: Authorization code from Spotify.
   *         schema:
   *           type: string
   *       - in: query
   *         name: state
   *         required: true
   *         description: State parameter from the authorization request.
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successfully authorized.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *       400:
   *         description: Bad request, token error.
   */
  public async authorizeSpotify(req: Request, res: Response): Promise<void> {
    const spotifyLogic = new SpotifyLogic()
    const redirectUrl = req.headers.referer ? req.headers.referer : undefined

    const tokenResponse = await spotifyLogic.RequestAccessToken(
      req.query.code as string,
      req.query.state as string,
      redirectUrl,
    )

    if (tokenResponse.error !== null) res.status(400).send(tokenResponse.error)

    res.status(200).send({
      accessToken: tokenResponse.accessToken,
    })
    return
  }
}

module.exports = AuthorizationController
