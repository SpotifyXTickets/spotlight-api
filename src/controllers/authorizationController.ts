import { AppController } from "./appController";
import { Response, Request, NextFunction } from "express";
import SpotifyLogic from "../logics/spotifyLogic";

export default class AuthorizationController extends AppController {
  constructor() {
    super();
    // uses the function in the baseclass to generate routes for the router.
    this.setRoutes([
      {
        uri: "/eventix",
        method: this.authorizeEventix,
      },
      {
        uri: "/spotify",
        method: this.authorizeSpotify,
      },
    ]);
  }

  public authorizeEventix(req: Request, res: Response): void {
    // axios.get("https://auth.openticket.tech/token/authorize", {
    //   params: {
    //     client_id: process.env.SPOTIFY_CLIENT_ID,
    //     response_type: "code",
    //     redirect_uri: "http://localhost:8000/authorize/spotify",
    //   },
    // });
    res.send("Authorize page");
  }

  public async authorizeSpotify(req: Request, res: Response): Promise<void> {
    const spotifyLogic = new SpotifyLogic();
    await spotifyLogic.RequestAccessToken(
      req.query.code as string,
      req.query.state as string,
      res
    );
    return;
    res.send("Authorize page");
  }
}

module.exports = AuthorizationController;
