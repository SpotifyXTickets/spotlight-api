import { AppController } from "./appController";
import { Request, Response } from "express";
import {
  Authenticated,
  NotAuthenticated,
} from "../middlewares/authenticationMiddleware";
import SpotifyLogic from "../logics/spotifyLogic";

export default class HomeController extends AppController {
  private spotifyLogic: SpotifyLogic;
  constructor() {
    super();
    this.spotifyLogic = new SpotifyLogic();

    this.setRoutes([
      {
        uri: "/",
        middlewares: [
          Authenticated,
        ] /** Uses function in base class to assign middleware */,
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

  public authorize(req: Request, res: Response): void {
    const spotifyLogic = new SpotifyLogic();
    spotifyLogic.RequestAuthorization(req, res);
    res.send("Hello world!");
  }

  public index(req: Request, res: Response): void {
    res.send("Hello world!");
  }

  public async getArtists(req: Request, res: Response): Promise<void> {
    const spotifyLogic = new SpotifyLogic();
    await spotifyLogic.getArtists(req, res);
    // res.send("Hello world!");
  }

  public async getPlaylists(req: Request, res: Response): Promise<void> {
    const spotifyLogic = new SpotifyLogic();
    await spotifyLogic.getPlaylists(req, res);
  }

  public async getUser(req: Request, res: Response): Promise<void> {
    const spotifyLogic = new SpotifyLogic();
    await spotifyLogic.getUser(req, res);
  }
}

module.exports = HomeController;
