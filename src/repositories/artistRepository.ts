import { Artist } from "../models/artist";
import CoreRepository from "./coreRepository";

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

  public async createArtist(artist: Artist): Promise<Artist | boolean> {
    try {
      const data = await (await this.collection).insertOne(artist);
      return data.acknowledged ? artist : false;
    } catch (err) {
      return false;
    }
  }
}
