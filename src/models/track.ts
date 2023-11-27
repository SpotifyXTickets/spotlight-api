import { ObjectId } from "bson";

export type Track = {
  _id: ObjectId; // will be the same as the trackId from spotify.
  name: string;
  accousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  liveness: number;
  loudness: number;
  speechiness: number;
  tempo: number;
  valence: number;
};

export default Track;
