import { AppController } from './appController'
import { Response, Request } from 'express'
import AuthorizationLogic from '../logics/authorizationLogic'
import { NotAuthenticated } from '../middlewares/authenticationMiddleware'

export default class AuthorizationController extends AppController {
  private authorizationLogic: AuthorizationLogic
  constructor() {
    super()
    this.authorizationLogic = new AuthorizationLogic()
    // uses the function in the baseclass to generate routes for the router.
    this.setRoutes([
      {
        uri: '/spotify',
        middlewares: [NotAuthenticated],
        method: this.authorizeSpotify,
      },
      {
        uri: '/',
        middlewares: [NotAuthenticated],
        method: this.authorize,
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

    res.status(200).send({
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
