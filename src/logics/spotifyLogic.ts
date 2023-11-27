import { AccessToken } from "./../models/accessToken";
import { AccessTokenRepository } from "./../repositories/accessTokenRepository";
import axios, { AxiosResponse } from "axios";
import { Request, Response } from "express";
import AuthenticationRepository from "../repositories/authenticationRepository";
import jwt from "jwt-simple";
import { User } from "../models/user";
import { ObjectId } from "bson";

export default class SpotifyLogic {
  private authenticationRepository: AuthenticationRepository;
  private apiHost: string;
  constructor() {
    this.authenticationRepository = new AuthenticationRepository();
    this.apiHost = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
  }
  public async checkAuthorization(
    accessToken: string
  ): Promise<boolean | string> {
    const accessTokenRepository = new AccessTokenRepository();
    const token = await accessTokenRepository.getAccessToken(accessToken);
    if (token) {
      if (token.updatedAt < new Date(Date.now() - 1000 * token.expiresIn)) {
        console.log("refresh");
        const refreshedToken = await this.RefreshAuthorization({
          accessToken: token.spotifyAccessToken,
          refreshToken: token.refreshToken,
        });

        if (refreshedToken) {
          return refreshedToken as string;
        }
        return false;
      }
      return true;
    }
    return false;
  }
  private scope: string =
    "user-read-private user-read-email user-follow-read playlist-read-private playlist-read-collaborative";
  private async RefreshAuthorization(auth: {
    accessToken: string;
    refreshToken: string;
  }): Promise<string | boolean> {
    const accessTokenRepository = new AccessTokenRepository();
    const oldToken = accessTokenRepository.getAccessTokenByRefreshToken(
      auth.refreshToken
    );
    const newToken = await axios
      .post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: auth.refreshToken,
          client_id: process.env.SPOTIFY_CLIENT_ID || "",
          client_secret: process.env.SPOTIFY_CLIENT_SECRET || "",
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
              "Basic " +
              Buffer.from(
                process.env.SPOTIFY_CLIENT_ID +
                  ":" +
                  process.env.SPOTIFY_CLIENT_SECRET
              ).toString("base64"),
          },
        }
      )
      .then(async (response) => {
        const token = await oldToken;
        return await accessTokenRepository.updateAccessToken({
          ...token,
          spotifyAccessToken: response.data.access_token,
        } as AccessToken);
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
    return newToken;
  }
  public async RequestAuthorization(
    req: Request,
    res: Response
  ): Promise<void> {
    const scope = this.scope;
    this.authenticationRepository.SetSpotifyAuthState(
      "randomstring",
      "http://localhost:8000" + req.url
    );
    res.redirect(
      `https://accounts.spotify.com/authorize?` +
        new URLSearchParams({
          response_type: "code",
          client_id: process.env.SPOTIFY_CLIENT_ID || "",
          scope,
          redirect_uri: `${this.apiHost}/spotify_authorizer`,
          state: "randomstring",
        }).toString()
    );
  }

  public async RequestAccessToken(code: string, state: string, res: Response) {
    const accessTokenRepository = new AccessTokenRepository();
    await axios
      .post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "authorization_code",
          redirect_uri: `${this.apiHost}/spotify_authorizer`,
          code,
          client_id: process.env.SPOTIFY_CLIENT_ID || "",
          client_secret: process.env.SPOTIFY_CLIENT_SECRET || "",
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then(async (response) => {
        // Get user for creation of a JWT token...
        // const t = response.data.access_token;
        // const ty = response.data.token_type;
        // console.log(user);

        const token = await accessTokenRepository.createAccessToken(
          response.data.access_token,
          response.data.expires_in,
          response.data.refresh_token
        );

        console.log(token);

        // const token = this.authenticationRepository.InsertSpotifyAuth({
        //   accessToken: response.data.access_token,
        //   tokenType: response.data.token_type,
        //   expiresIn: response.data.expires_in,
        //   refreshToken: response.data.refresh_token,
        //   scope: this.scope,
        // });
        const { redirectUrl } =
          this.authenticationRepository.GetSpotifyAuthState("randomstring");
        res.status(200).json({
          accessToken: token,
        });
        return;
      })
      .catch((error) => {
        console.error(error);
        res.status(400).json({ message: error.message });
      });
    return;
  }

  public async getUser(apiKey: string) {
    const accessTokenRepository = new AccessTokenRepository();
    const accessToken = await accessTokenRepository.getAccessToken(apiKey);
    if (accessToken) {
      const data = await axios
        .get("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: "Bearer " + accessToken.spotifyAccessToken,
          },
        })
        .then((response) => {
          console.log(response.data);
          return response.data;
        })
        .catch((error) => {
          console.error(error);
          return null;
        });
      if (data) {
        return data;
      }
    }
    return false;
  }
  public async getPlaylists(apiKey: string) {
    const accessTokenRepository = new AccessTokenRepository();
    const accessToken = await accessTokenRepository.getAccessToken(apiKey);
    if (accessToken) {
      return await axios
        .get("https://api.spotify.com/v1/me/playlists", {
          headers: {
            Authorization: "Bearer " + accessToken.spotifyAccessToken,
          },
        })
        .then((response) => {
          return response.data;
        });
    }
    return false;
  }
  // Class properties and methods go here
  public async getArtists(req: Request, res: Response) {
    const auth = this.authenticationRepository.GetSpotifyAuth();
    if (auth) {
      await axios
        .get("https://api.spotify.com/v1/me/following?type=artist", {
          headers: {
            Authorization:
              auth.spotify.tokenType + " " + auth.spotify.accessToken,
          },
        })
        .then((response) => {
          res.send(response.data);
        });
    }
    res.send("Authorize page");
  }
}
