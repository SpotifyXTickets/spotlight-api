import { ObjectId } from "bson";
import {
  SpotifyAudioFeaturesType,
  SpotifyTopTrackType,
} from "../types/spotifyTypes";

export class Track {
  _id?: ObjectId; // will be the same as the trackId from spotify.
  spotifyId: string;
  name: string;
  accousticness?: number;
  danceability?: number;
  energy?: number;
  instrumentalness?: number;
  liveness?: number;
  loudness?: number;
  speechiness?: number;
  tempo?: number;
  valence?: number;

  constructor(
    spotifyTrackData: SpotifyTopTrackType,
    spotifyAudiaFeaturesData: SpotifyAudioFeaturesType
  ) {
    this.spotifyId = spotifyTrackData.id;
    this.name = spotifyTrackData.name;
    this.accousticness = spotifyAudiaFeaturesData.acousticness;
    this.danceability = spotifyAudiaFeaturesData.danceability;
    this.energy = spotifyAudiaFeaturesData.energy;
    this.instrumentalness = spotifyAudiaFeaturesData.instrumentalness;
    this.liveness = spotifyAudiaFeaturesData.liveness;
    this.loudness = spotifyAudiaFeaturesData.loudness;
    this.speechiness = spotifyAudiaFeaturesData.speechiness;
    this.tempo = spotifyAudiaFeaturesData.tempo;
    this.valence = spotifyAudiaFeaturesData.valence;
  }
}
export default Track;
