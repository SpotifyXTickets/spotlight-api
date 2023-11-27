import { ObjectId } from "bson";

export type Artist = {
  _id: ObjectId;
  spotifyId?: string;
  ticketMasterId?: string;
  name: string;
  imageUrl: string;
  meanScore: number;
  website?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  spotify?: string;
  lastfm?: string;
};
