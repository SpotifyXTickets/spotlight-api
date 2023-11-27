import { Artist } from "../models/artist";
import CoreRepository from "./coreRepository";

export class ArtistRepository extends CoreRepository {
  constructor() {
    super("artists");
  }

  public async getArtists(): Promise<Artist[]> {
    const data = await (await this.collection).find({}).toArray();
    return data as unknown as Artist[];
  }

  public async createArtist(artist: Artist): Promise<Artist | boolean> {
    const data = await (await this.collection).insertOne(artist);
    return data.acknowledged ? artist : false;
  }
}
