import Container, { Service } from 'typedi'
import SpotifyLogic from './spotifyLogic'
import 'reflect-metadata'
import { Response, Request } from 'express'

@Service()
export default class AuthorizationLogic {
  private spotifyLogic: SpotifyLogic

  constructor() {
    this.spotifyLogic = Container.get(SpotifyLogic)
  }

  public async AuthorizeSpotify(
    req: Request,
    res: Response,
    redirectUrl?: string,
  ) {
    await this.spotifyLogic.RequestAuthorization(req, res, redirectUrl)
  }

  public async CheckAuthorization(apiKey?: string): Promise<string | boolean> {
    if (!apiKey) {
      return false
    }
    return this.spotifyLogic.checkAuthorization(apiKey)
  }

  public async RequestAccessToken(
    code: string,
    state: string,
    redirectUrl?: string,
  ): Promise<{ accessToken: string; error?: string }> {
    return await this.spotifyLogic.RequestAccessToken(code, state, redirectUrl)
  }
}

module.exports = AuthorizationLogic
