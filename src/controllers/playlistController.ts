import { Request, Response } from 'express'
import { Authenticated } from '../middlewares/authenticationMiddleware'
import { AppController } from './appController'
import { PlaylistLogic } from '../logics/playlistLogic'

export class PlaylistController extends AppController {
  private playlistLogic: PlaylistLogic
  constructor() {
    super()
    this.playlistLogic = new PlaylistLogic()
    this.setRoutes([
      {
        uri: '/',
        middlewares: [Authenticated],
        method: this.getPlaylists.bind(this),
      },
    ])
  }

  /**
   * @swagger
   * path:
   *   /playlist:
   *     get:
   *       summary: Get user playlists.
   *       description: Retrieve playlists of the authenticated user.
   *       tags: [Home]
   *       security:
   *         - BearerAuth: []
   *       responses:
   *         200:
   *           description: A list of user playlists.
   */
  public async getPlaylists(req: Request, res: Response): Promise<void> {
    const data = await this.playlistLogic.getPlaylists(
      req.headers.authorization!.split(' ')[1],
    )

    data
      ? res.status(200).json(data)
      : res.status(400).json({ error: 'Something went wrong' })
  }
}

export default PlaylistController
