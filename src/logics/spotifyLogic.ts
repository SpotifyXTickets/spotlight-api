import { AccessToken } from "./../models/accessToken";
import { AccessTokenRepository } from "./../repositories/accessTokenRepository";
import axios, { AxiosResponse } from "axios";
import { Request, Response } from "express";
import AuthenticationRepository from "../repositories/authenticationRepository";
import jwt from "jwt-simple";
import { User } from "../models/user";
import { ObjectId } from "bson";
import { Artist } from "../models/artist";
import {
  SpotifyArtistType,
  SpotifyAudioFeaturesType,
  SpotifyTopTrackType,
} from "../types/spotifyTypes";

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
  public async RefreshAuthorization(auth: {
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
    res: Response,
    redirectUri?: string
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
          redirect_uri: redirectUri ?? `${this.apiHost}/spotify_authorizer`,
          state: "randomstring",
        }).toString()
    );
  }

  public async RequestAccessToken(
    code: string,
    state: string,
    redirectUri?: string
  ): Promise<{
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
    error?: string;
  }> {
    const accessTokenRepository = new AccessTokenRepository();
    const token = await axios
      .post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "authorization_code",
          redirect_uri: redirectUri ?? `${this.apiHost}/spotify_authorizer`,
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

        if (redirectUri === undefined) {
          return {
            accessToken: response.data.access_token as string,
            expiresIn: response.data.expires_in as number,
            tokenType: response.data.token_type as string,
            error: null,
          };
        }

        const token = await accessTokenRepository.createAccessToken(
          response.data.access_token,
          response.data.expires_in,
          response.data.refresh_token
        );

        if (!token) {
          return {
            accessToken: "",
            expiresIn: 3600,
            refreshToken: "",
            error: "Could not create access token",
          };
        }

        // const token = this.authenticationRepository.InsertSpotifyAuth({
        //   accessToken: response.data.access_token,
        //   tokenType: response.data.token_type,
        //   expiresIn: response.data.expires_in,
        //   refreshToken: response.data.refresh_token,
        //   scope: this.scope,
        // });
        const { redirectUrl } =
          this.authenticationRepository.GetSpotifyAuthState("randomstring");

        return {
          accessToken: token as string,
          expiresIn: response.data.expires_in as number,
          refreshToken: response.data.refresh_token as string,
          error: null,
        };
      })
      .catch((error) => {
        console.error(error);
        return {
          accessToken: "",
          expiresIn: 3600,
          refreshToken: "",
          error: error,
        };
      });
    return {
      accessToken: token.accessToken as string,
      expiresIn: token.expiresIn,
      refreshToken: token.refreshToken as string,
      error: token.error,
    };
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
        })
        .catch((error) => {
          console.error(error);
          return false;
        });
    }
    return false;
  }
  // Class properties and methods go here
  public async getFollowingArtists(apiKey: string): Promise<any[]> {
    await axios
      .get("https://api.spotify.com/v1/me/following?type=artist", {
        headers: {
          Authorization: "Bearer " + apiKey,
        },
      })
      .then((response) => {
        return response.data;
      });
    return [];
  }

  public async getArtistsByIds(
    apiKey: string,
    artistIds: string[]
  ): Promise<SpotifyArtistType[]> {
    return await axios
      .get(`https://api.spotify.com/v1/artists?ids=${artistIds.toString()}`, {
        headers: {
          Authorization: "Bearer " + apiKey,
        },
      })
      .then((response) => {
        console.log(response.data);
        const artists = response.data.artists as SpotifyArtistType[];
        return artists.filter((artist) => artist !== null);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          console.log("401");
          return [];
        }
        console.error(error);
        return [];
      });
  }

  public async getTopTracksOfArtist(
    apiKey: string,
    artistId: string
  ): Promise<SpotifyTopTrackType[]> {
    return await axios
      .get(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=NL`,
        {
          headers: {
            Authorization: "Bearer " + apiKey,
          },
        }
      )
      .then((response) => {
        return response.data.tracks;
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
  }

  public async getTracksAudioFeatures(
    apiKey: string,
    trackIds: string[]
  ): Promise<SpotifyAudioFeaturesType[]> {
    return await axios
      .get(
        `https://api.spotify.com/v1/audio-features?ids=${trackIds.toString()}`,
        {
          headers: {
            Authorization: "Bearer " + apiKey,
          },
        }
      )
      .then((response) => {
        return response.data.audio_features as SpotifyAudioFeaturesType[];
      })
      .catch((error) => {
        console.error(error);
        return [];
      });
  }
}
