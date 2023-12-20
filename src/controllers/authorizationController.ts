import { AppController } from './appController'
import { Response, Request } from 'express'
import AuthorizationLogic from '../logics/authorizationLogic'
import { NotAuthenticated } from '../middlewares/authenticationMiddleware'
import SpotifyLogic from '../logics/spotifyLogic'
import isErrorResponse from '../helpers/isErrorResponse'

export default class AuthorizationController extends AppController {
  private authorizationLogic: AuthorizationLogic
  private spotifyLogic: SpotifyLogic

  constructor() {
    super()
    this.authorizationLogic = new AuthorizationLogic()
    this.spotifyLogic = new SpotifyLogic()
    // uses the function in the baseclass to generate routes for the router.
    this.setRoutes([
      {
        uri: '/spotify',
        middlewares: [NotAuthenticated],
        method: this.authorizeSpotify.bind(this),
      },
      {
        uri: '/',
        middlewares: [NotAuthenticated],
        method: this.authorize.bind(this),
      },
    ])
  }

  public async authorizeSpotify(req: Request, res: Response): Promise<void> {
    const redirectUrl = req.headers.referer ? req.headers.referer : undefined

    const tokenResponse = await this.authorizationLogic.RequestAccessToken(
      req.query.code as string,
      req.query.state as string,
      redirectUrl,
    )
    if (tokenResponse.error !== null) res.status(400).send(tokenResponse.error)

    const userResponse = await this.spotifyLogic.getUser(
      tokenResponse.accessToken,
    )

    if (isErrorResponse(userResponse)) {
      res.status(userResponse.status).json({
        error: {
          status: userResponse.status,
          message: userResponse.message,
        },
      })
      return
    }

    res.status(200).send({
      displayName: userResponse.user.display_name,
      profilePicture: userResponse.user.images[0]
        ? userResponse.user.images[0].url
        : '',
      accessToken: tokenResponse.accessToken,
    })
    return
  }

  /**
   * @swagger
   * path:
   *   /authorize:
   *     get:
   *       summary: Authorize user.
   *       description: Authorize user for the application.
   *       tags: [Home]
   *       security:
   *         - BearerAuth: []
   *       responses:
   *         200:
   *           description: Authorization response.
   */
  public async authorize(req: Request, res: Response): Promise<void> {
    const redirectUrl = req.headers.referer ? req.headers.referer : undefined
    await this.authorizationLogic.AuthorizeSpotify(req, res, redirectUrl)
  }
}

module.exports = AuthorizationController
