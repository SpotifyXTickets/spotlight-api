import { AppController } from "./appController";
import { Request, Response } from "express";
import { Authenticated } from "../middlewares/authenticationMiddleware";
import SpotifyLogic from "../logics/spotifyLogic";

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
        uri: "/artists",
        middlewares: [Authenticated],
        method: this.getArtists,
      },
    ]);
  }

  public index(req: Request, res: Response): void {
    res.send("Hello world!");
  }

  public async getArtists(req: Request, res: Response): Promise<void> {
    const spotifyLogic = new SpotifyLogic();
    await spotifyLogic.getUser(req, res);
    // res.send("Hello world!");
  }
}

module.exports = HomeController;
