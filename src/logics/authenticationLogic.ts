import EventixLogic from "./eventixLogic";
import SpotifyLogic from "./spotifyLogic";
import { Response, Request } from "express";

export default class AuthenticationLogic {
  public AuthorizeEventix() {
    let eventixLogic = new EventixLogic();
    eventixLogic.RequestAuthorization();
  }

  public async AuthorizeSpotify(req: Request, res: Response) {
    let spotifyLogic = new SpotifyLogic();
    await spotifyLogic.RequestAuthorization(req, res);
  }

  public CheckAuthorization(req: Request, res: Response) {
    let spotifyLogic = new SpotifyLogic();
    return spotifyLogic.checkAuthorization();
  }
}

module.exports = AuthenticationLogic;
