import { Artist } from "../models/artist";
import CoreRepository from "./coreRepository";
import Event from "../models/event";

export class ArtistRepository extends CoreRepository {
  constructor() {
    super(
      "artists",
      ["spotifyId", "ticketMasterId"],
      [
        {
          name: "artistEvents",
          foreignTable: "events",
          primaryKey: "ticketMasterId",
          foreignKey: "ticketMasterId",
        },
      ]
    );
  }

  public async getArtists(): Promise<Artist[]> {
    const data = await (await this.collection).find({}).toArray();
    return data as unknown as Artist[];
  }

  public async getArtistBySpotifyId(
    spotifyId: string
  ): Promise<Artist | boolean> {
    const data = await (
      await this.collection
    ).findOne({ spotifyId: spotifyId });
    return data ? (data as unknown as Artist) : false;
  }

  public async getArtistsByEvent(event: Event): Promise<Artist[]> {
    const artistIds = await this.getKeysFromRelationTable("artistEvents", {
      foreignKey: event.ticketMasterId,
    });

    if (artistIds === false) {
      return [];
    }

    const artists = (await (
      await this.collection
    )
      .find({
        spotifyId: {
          $in: artistIds as string[],
        },
      })
      .toArray()) as Artist[];

    return artists;
  }

  public async createArtist(artist: Artist): Promise<Artist | boolean> {
    try {
      const data = await (await this.collection).insertOne(artist);
      return data.acknowledged ? artist : false;
    } catch (err) {
      return false;
    }
  }

  public async updateArtist(artist: Artist): Promise<Artist | boolean> {
    try {
      const filter = { spotifyId: artist.spotifyId };
      const update = { $set: artist };
      const data = await (await this.collection).updateOne(filter, update);
      return data.modifiedCount ? artist : false;
    } catch (err) {
      return false;
    }
  }
}
