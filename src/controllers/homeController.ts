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
  constructor() {
    super();

    this.setRoutes([
      {
        uri: "/",
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
    res.redirect("/api-docs");
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
    const spotifyLogic = new SpotifyLogic();
    const artists = await spotifyLogic.getFollowingArtists(
      req.headers.authorization!.split(" ")[1]
    );
    res.status(200).send(artists);
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
    const spotifyLogic = new SpotifyLogic();
    const user = await spotifyLogic.getUser(
      req.headers.authorization!.split(" ")[1]
    );

    if (!user) {
      res.status(401).json({ error: "Something went wrong" });
      return;
    }
    res.status(200).send(user);
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
    const spotifyLogic = new SpotifyLogic();
    await spotifyLogic.RequestAuthorization(req, res);
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
    const spotifyLogic = new SpotifyLogic();
    if (req.headers.authorization === undefined) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const data = await spotifyLogic.getPlaylists(
      req.headers.authorization!.split(" ")[1]
    );

    data
      ? res.status(200).json(data)
      : res.status(400).json({ error: "Something went wrong" });
  }
}

module.exports = HomeController;
