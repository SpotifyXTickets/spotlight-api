import { AppController } from './appController'
import { Request, Response } from 'express'
import { Authenticated } from '../middlewares/authenticationMiddleware'
import SpotifyLogic from '../logics/spotifyLogic'

/**
 * @swagger
 * tags:
 *   name: Home
 *   description: Endpoints related to the home controller
 */

export default class HomeController extends AppController {
  constructor() {
    super()

    this.setRoutes([
      {
        uri: '/',
        method: this.index,
      },
      {
        uri: '/artist',
        middlewares: [Authenticated],
        method: this.getArtists,
      },
    ])
  }

  /**
   * @swagger
   * path:
   *   /:
   *     get:
   *       summary: Get home page content.
   *       description: Retrieve the home page content.
   *       tags: [Home]
   *       security:
   *         - BearerAuth: []
   *       responses:
   *         200:
   *           description: Home page content.
   */
  public index(req: Request, res: Response): void {
    res.redirect('/api-docs')
  }

  /**
   * @swagger
   * path:
   *   /artist:
   *     get:
   *       summary: Get artists.
   *       description: Retrieve a list of artists.
   *       tags: [Home]
   *       security:
   *         - BearerAuth: []
   *       responses:
   *         200:
   *           description: A list of artists.
   */
  public async getArtists(req: Request, res: Response): Promise<void> {
    const spotifyLogic = new SpotifyLogic()
    const artists = await spotifyLogic.getFollowingArtists(
      req.headers.authorization!.split(' ')[1],
    )
    res.status(200).send(artists)
  }
}

module.exports = HomeController
