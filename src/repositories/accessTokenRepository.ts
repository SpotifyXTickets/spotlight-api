import { AccessToken } from './../models/accessToken'
import CoreRepository from './coreRepository'
import jwt from 'jwt-simple'

export class AccessTokenRepository extends CoreRepository {
  constructor() {
    super('accessTokens')
  }

  async getAccessToken(AccessToken: string): Promise<AccessToken | null> {
    return (await (
      await this.collection
    ).findOne({
      accessToken: AccessToken,
    })) as AccessToken | null
  }

  async getAccessTokenByRefreshToken(
    refreshToken: string,
  ): Promise<AccessToken | null> {
    const token = (await (
      await this.collection
    ).findOne({
      refreshToken: refreshToken,
    })) as AccessToken | null

    return token
  }

  async createAccessToken(
    spotifyAccessToken: string,
    expiresIn: number,
    refresh_token: string,
  ): Promise<string | boolean> {
    const token = jwt.encode(
      {
        spotifyAccessToken: spotifyAccessToken,
        expiresIn: expiresIn,
        createdAt: new Date(),
      },
      process.env.JWT_SECRET_KEY ?? 'supersecretkey',
    )
    const accessToken = {
      accessToken: token,
      spotifyAccessToken: spotifyAccessToken,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresIn: expiresIn,
      refreshToken: refresh_token,
    } as AccessToken
    const result = await (await this.collection).insertOne(accessToken)
    return result.acknowledged ? token : false
  }

  async updateAccessToken(accessToken: AccessToken): Promise<boolean | string> {
    const token = jwt.encode(
      {
        spotifyAccessToken: accessToken.spotifyAccessToken,
        expiresIn: accessToken.expiresIn,
        refreshToken: accessToken.refreshToken,
      },
      process.env.JWT_SECRET_KEY ?? 'supersecretkey',
    )
    const result = await (
      await this.collection
    ).updateOne(
      { _id: accessToken._id },
      {
        $set: {
          accessToken: token,
          spotifyAccessToken: accessToken.spotifyAccessToken,
          refreshToken: accessToken.refreshToken,
          expiresIn: accessToken.expiresIn,
          updatedAt: new Date(),
        },
      },
    )

    return result.acknowledged ? token : false
  }

  // Add your methods for communicating with MongoDB here
}
