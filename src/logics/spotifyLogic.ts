import axios, { AxiosResponse } from 'axios'
import { Request, Response } from 'express'
import AuthenticationRepository from '../repositories/authenticationRepository'

export default class SpotifyLogic {
  private authenticationRepository: AuthenticationRepository
  private apiHost: string
  constructor() {
    this.authenticationRepository = new AuthenticationRepository()
    this.apiHost = process.env.FRONTEND_ORIGIN || 'http://localhost:3000'
  }
  public checkAuthorization(accessToken: string) {
    const auth = this.authenticationRepository.GetSpotifyAuth()
    if (auth && auth.accessToken === accessToken) {
      // console.log(auth.spotify);
      // console.log(Date.now());
      // console.log(new Date(Date.now() - 1000 * auth.spotify.expiresIn));
      // console.log(
      //   auth.spotify.updatedAt <
      //     new Date(Date.now() - 1000 * auth.spotify.expiresIn)
      // );
      if (
        auth.spotify.updatedAt <
        new Date(Date.now() - 1000 * auth.spotify.expiresIn)
      ) {
        this.RefreshAuthorization(auth.spotify)
        return true
      }
      return true
    } else if (auth) {
      console.log(auth)
      console.log('need to figure this out...')
      return true
    }
    return false
  }
  private scope: string =
    'user-read-private user-read-email user-follow-read playlist-read-private playlist-read-collaborative'
  private async RefreshAuthorization(auth: {
    accessToken: string
    refreshToken: string
    scope: string
  }) {
    await axios
      .post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: auth.refreshToken,
          client_id: process.env.SPOTIFY_CLIENT_ID || '',
          client_secret: process.env.SPOTIFY_CLIENT_SECRET || '',
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization:
              'Basic ' +
              Buffer.from(
                process.env.SPOTIFY_CLIENT_ID +
                  ':' +
                  process.env.SPOTIFY_CLIENT_SECRET,
              ).toString('base64'),
          },
        },
      )
      .then((response) => {
        this.authenticationRepository.UpdateSpotifyAuth(auth.accessToken, {
          accessToken: response.data.access_token,
          tokenType: response.data.token_type,
          expiresIn: response.data.expires_in,
          refreshToken: auth.refreshToken,
          scope: auth.scope,
        })
      })
      .catch((error) => {
        console.error(error)
      })
  }
  public async RequestAuthorization(
    req: Request,
    res: Response,
  ): Promise<void> {
    const scope = this.scope
    this.authenticationRepository.SetSpotifyAuthState(
      'randomstring',
      'http://localhost:8000' + req.url,
    )
    res.redirect(
      `https://accounts.spotify.com/authorize?` +
        new URLSearchParams({
          response_type: 'code',
          client_id: process.env.SPOTIFY_CLIENT_ID || '',
          scope,
          redirect_uri: `${this.apiHost}/spotify_authorizer`,
          state: 'randomstring',
        }).toString(),
    )
  }

  public async RequestAccessToken(code: string, state: string, res: Response) {
    await axios
      .post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          redirect_uri: `${this.apiHost}/spotify_authorizer`,
          code,
          client_id: process.env.SPOTIFY_CLIENT_ID || '',
          client_secret: process.env.SPOTIFY_CLIENT_SECRET || '',
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then((response) => {
        const token = this.authenticationRepository.InsertSpotifyAuth({
          accessToken: response.data.access_token,
          tokenType: response.data.token_type,
          expiresIn: response.data.expires_in,
          refreshToken: response.data.refresh_token,
          scope: this.scope,
        })
        const { redirectUrl } =
          this.authenticationRepository.GetSpotifyAuthState('randomstring')
        res.status(200).json({
          accessToken: token,
        })
        return
      })
      .catch((error) => {
        console.error(error)
        res.status(400).json({ message: error.message })
      })
    return
  }

  public async getUser(req: Request, res: Response) {
    const auth = this.authenticationRepository.GetSpotifyAuth()
    if (auth) {
      await axios
        .get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization:
              auth.spotify.tokenType + ' ' + auth.spotify.accessToken,
          },
        })
        .then((response) => {
          res.send(response.data)
        })
        .catch((error) => {
          res.status(400).json({ message: error.message })
        })
    }
    res.send('Authorize page')
  }
  public async getPlaylists(req: Request, res: Response) {
    const auth = this.authenticationRepository.GetSpotifyAuth()
    if (auth) {
      await axios
        .get('https://api.spotify.com/v1/me/playlists', {
          headers: {
            Authorization:
              auth.spotify.tokenType + ' ' + auth.spotify.accessToken,
          },
        })
        .then((response) => {
          res.send(response.data)
        })
    }
    res.send('Authorize page')
  }
  // Class properties and methods go here
  public async getArtists(req: Request, res: Response) {
    const auth = this.authenticationRepository.GetSpotifyAuth()
    if (auth) {
      await axios
        .get('https://api.spotify.com/v1/me/following?type=artist', {
          headers: {
            Authorization:
              auth.spotify.tokenType + ' ' + auth.spotify.accessToken,
          },
        })
        .then((response) => {
          res.send(response.data)
        })
    }
    res.send('Authorize page')
  }
}
