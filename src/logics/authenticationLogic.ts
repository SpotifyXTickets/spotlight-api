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

  public async CheckAuthorization(apiKey?: string): Promise<string | boolean> {
    if (!apiKey) {
      return false;
    }

    let spotifyLogic = new SpotifyLogic();
    return spotifyLogic.checkAuthorization(apiKey);
  }
}

module.exports = AuthenticationLogic;
