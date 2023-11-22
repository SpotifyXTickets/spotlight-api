import { Db } from "mongodb";
import { AccessToken } from "./../models/accessToken";
import CoreRepository from "./coreRepository";
import { ObjectId } from "bson";
import { User } from "../models/user";
import jwt from "jwt-simple";

export class AccessTokenRepository extends CoreRepository {
  constructor(testDb?: Db) {
    super("accessTokens", testDb);
  }

  async getAccessToken(AccessToken: string): Promise<AccessToken> {
    await this.initalizeMongo();
    return (await this.collection!.findOne({
      accessToken: AccessToken,
    })) as AccessToken;
  }

  async createAccessToken(
    spotifyAccessToken: string,
    expiresIn: number,
    refresh_token: string,
    user: User
  ): Promise<string | boolean> {
    await this.initalizeMongo();
    const token = jwt.encode(
      {
        spotifyId: user._id,
        displayName: user.display_name,
        images: user.images,
      },
      process.env.JWT_SECRET_KEY ?? "supersecretkey"
    );
    const accessToken = {
      _id: user._id,
      accessToken: token,
      spotifyAccessToken: spotifyAccessToken,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresIn: expiresIn,
      refreshToken: refresh_token,
    } as AccessToken;
    const result = await this.collection!.insertOne(accessToken);
    return result.acknowledged ? token : false;
  }

  async updateAccessToken(accessToken: AccessToken): Promise<boolean> {
    await this.initalizeMongo();
    const oldtoken = jwt.decode(
      accessToken.accessToken,
      process.env.JWT_SECRET_KEY ?? "supersecretkey"
    ) as {
      spotifyId: ObjectId;
      displayName: string;
      images: { url: string; height: number; width: number }[];
    };
    const token = jwt.encode(
      {
        spotifyId: accessToken._id,
        displayName: oldtoken.displayName,
        images: oldtoken.images,
      },
      process.env.JWT_SECRET_KEY ?? "supersecretkey"
    );
    const result = await this.collection!.updateOne(
      { _id: accessToken._id },
      {
        $set: {
          accessToken: accessToken.accessToken,
          spotifyAccessToken: accessToken.spotifyAccessToken,
          refreshToken: accessToken.refreshToken,
          expiresIn: accessToken.expiresIn,
          updatedAt: new Date(),
        },
      }
    );

    return result.acknowledged;
  }

  // Add your methods for communicating with MongoDB here
}
