import { AppController } from "./appController";
import { Request, Response } from "express";
import {
  Authenticated,
  NotAuthenticated,
} from "../middlewares/authenticationMiddleware";
import SpotifyLogic from "../logics/spotifyLogic";

/**
 * @swagger
 * tags:
 *   name: Home
 *   description: Endpoints related to the home controller
 */

export default class HomeController extends AppController {
  private spotifyLogic: SpotifyLogic;

  constructor() {
    super();
    this.spotifyLogic = new SpotifyLogic();

    this.setRoutes([
      {
        uri: "/",
        middlewares: [Authenticated],
        method: this.index,
      },
      {
        uri: "/artist",
        middlewares: [Authenticated],
        method: this.getArtists,
      },
      {
        uri: "/user",
        middlewares: [Authenticated],
        method: this.getUser,
      },
      {
        uri: "/authorize",
        middlewares: [NotAuthenticated],
        method: this.authorize,
      },
      {
        uri: "/playlist",
        middlewares: [Authenticated],
        method: this.getPlaylists,
      },
    ]);
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
    res.send("Hello world!");
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
    await this.spotifyLogic.getArtists(req, res);
  }

  /**
   * @swagger
   * path:
   *   /user:
   *     get:
   *       summary: Get user information.
   *       description: Retrieve user information.
   *       tags: [Home]
   *       security:
   *         - BearerAuth: []
   *       responses:
   *         200:
   *           description: User information.
   */
  public async getUser(req: Request, res: Response): Promise<void> {
    await this.spotifyLogic.getUser(req, res);
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
    this.spotifyLogic.RequestAuthorization(req, res);
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
    await this.spotifyLogic.getPlaylists(req, res);
  }
}

module.exports = HomeController;
