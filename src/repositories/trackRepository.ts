import { Collection, ObjectId } from "mongodb";
import Track from "../models/track";
import CoreRepository from "./coreRepository";

export class TrackRepository extends CoreRepository {
  constructor() {
    super("tracks", [
      {
        name: "artistTracks",
        foreignTable: "artists",
        primaryKey: "_id",
        foreignKey: "spotifyId",
      },
    ]);
  }

  public async getTrack(trackSpotifyId: ObjectId): Promise<Track> {
    const data = (await this.collection).findOne({ _id: trackSpotifyId });
    return data as unknown as Track;
  }

  public async getTracksByArtistId(
    artistSpotifyId: ObjectId
  ): Promise<Track[]> {
    const trackIds = await this.getKeysFromRelationTable("artistTracks", {
      foreignKey: artistSpotifyId,
    });

    if (trackIds === false) {
      return [];
    }

    const tracks = await (
      await this.collection
    )
      .find({
        _id: {
          $in: trackIds as ObjectId[],
        },
      })
      .toArray();

    return tracks as unknown as Track[];
  }

  public async createTrackFromArtist(
    track: Track,
    artistId: ObjectId
  ): Promise<Track | boolean> {
    this.insertIntoRelationTable("artistTracks", artistId, track._id);
    const collection = await this.collection;

    const data = await collection.insertOne(track);

    return data.acknowledged ? track : false;
  }

  public async updateTrack(track: Track): Promise<Track | boolean> {
    const collection = await this.collection;
    const data = await collection.updateOne(
      { _id: track._id },
      { $set: track }
    );

    return data.acknowledged ? track : false;
  }

  public async deleteTrack(trackId: ObjectId): Promise<boolean> {
    const delResult = await this.removeFromRelationTable("artistTracks", {
      primaryKey: trackId,
    });

    if (!delResult) {
      return false;
    }

    const collection = await this.collection;
    const data = await collection.deleteOne({ _id: trackId });
    return data.acknowledged;
  }
}
