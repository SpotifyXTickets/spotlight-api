import { ObjectId } from 'bson'
import {
  SpotifyAudioFeaturesType,
  SpotifyTopTrackType,
} from '../types/spotifyTypes'

export class Track {
  _id?: ObjectId // will be the same as the trackId from spotify.
  spotifyId: string
  name: string
  accousticness?: number
  danceability?: number
  energy?: number
  instrumentalness?: number
  liveness?: number
  loudness?: number
  speechiness?: number
  tempo?: number
  valence?: number

  constructor(
    spotifyTrackData: SpotifyTopTrackType,
    spotifyAudiaFeaturesData: SpotifyAudioFeaturesType,
  ) {
    this.spotifyId = spotifyTrackData.id
    this.name = spotifyTrackData.name
    this.accousticness = spotifyAudiaFeaturesData
      ? spotifyAudiaFeaturesData.acousticness
      : undefined
    this.danceability = spotifyAudiaFeaturesData
      ? spotifyAudiaFeaturesData.danceability
      : undefined
    this.energy = spotifyAudiaFeaturesData
      ? spotifyAudiaFeaturesData.energy
      : undefined
    this.instrumentalness = spotifyAudiaFeaturesData
      ? spotifyAudiaFeaturesData.instrumentalness
      : undefined
    this.liveness = spotifyAudiaFeaturesData
      ? spotifyAudiaFeaturesData.liveness
      : undefined
    this.loudness = spotifyAudiaFeaturesData
      ? spotifyAudiaFeaturesData.loudness
      : undefined
    this.speechiness = spotifyAudiaFeaturesData
      ? spotifyAudiaFeaturesData.speechiness
      : undefined
    this.tempo = spotifyAudiaFeaturesData
      ? spotifyAudiaFeaturesData.tempo
      : undefined
    this.valence = spotifyAudiaFeaturesData
      ? spotifyAudiaFeaturesData.valence
      : undefined
  }
}
export default Track
