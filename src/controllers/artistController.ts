import { ArtistLogic } from '../logics/artistLogic'
import { CoreController } from '../coreController'
import { Request, Response } from 'express'
import 'reflect-metadata'
import { Container } from 'typedi'

export class ArtistController extends CoreController {
  private artistLogic: ArtistLogic

  constructor() {
    super()
    this.artistLogic = Container.get(ArtistLogic)
    this.setRoutes([
      {
        uri: '/',
        method: this.getArtists.bind(this),
      },
      {
        uri: '/:id',
        method: this.getArtistById.bind(this),
      },
    ])
  }

  /**
   * @swagger
   * path:
   *   /artist:
   *     get:
   *       summary: Get artists.
   *       description: Retrieve a list of artists.
   *       tags: [Artist]
   *       security:
   *         - BearerAuth: []
   *       responses:
   *         200:
   *           description: A list of artists.
   */
  public async getArtists(req: Request, res: Response): Promise<void> {
    const artists = await this.artistLogic.getArtists()
    res.status(200).send(artists)
  }

  /**
   * @swagger
   * path:
   *   /artist/{id}:
   *     get:
   *       summary: Get artist by id.
   *       description: Retrieve an artist by id.
   *       tags: [Artist]
   *       security:
   *         - BearerAuth: []
   *       responses:
   *         200:
   *           description: An artist.
   */
  public async getArtistById(req: Request, res: Response): Promise<void> {
    try {
      const artist = await this.artistLogic.getArtistById(req.params.id)
      if (!artist) {
        res.status(404).send({
          status: 404,
          message: 'Artist not found',
        })
        return
      }
      res.status(200).send(artist)
    } catch (error) {
      res.status(500).send({
        status: 500,
        message:
          'Something went wrong while trying to get artist with id ' +
          req.params.id,
      })
    }
  }
}
