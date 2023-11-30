import { Collection, ObjectId } from "mongodb";
import Track from "../models/track";
import CoreRepository from "./coreRepository";

export class TrackRepository extends CoreRepository {
  constructor() {
    super(
      "tracks",
      ["spotifyId"],
      [
        {
          name: "artistTracks",
          foreignTable: "artists",
          primaryKey: "spotifyId",
          foreignKey: "spotifyId",
        },
      ]
    );
  }

  public async linkTracktoArtist(
    track: Track,
    artistId: string | number
  ): Promise<void> {
    await this.insertIntoRelationTable(
      "artistTracks",
      artistId,
      track.spotifyId
    );
  }

  public async getTrack(trackSpotifyId: string): Promise<Track> {
    const data = (await this.collection).findOne({ spotifyId: trackSpotifyId });
    return data as unknown as Track;
  }

  public async getTracksByArtistId(artistSpotifyId: string): Promise<Track[]> {
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
        spotifyId: {
          $in: trackIds as string[],
        },
      })
      .toArray();

    return tracks as unknown as Track[];
  }

  public async createTrack(track: Track): Promise<Track | boolean> {
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
