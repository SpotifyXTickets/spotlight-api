import { ObjectId } from 'bson'
import Artist from './artist'

export type EmbeddedTrack = Track & {
  _embedded?: {
    artists: Artist[]
  }
}

export type Track = {
  _id?: ObjectId // will be the same as the trackId from spotify.
  spotifyId: string
  name: string
  audioData?: {
    accousticness: number
    danceability: number
    energy: number
    instrumentalness: number
    liveness: number
    loudness: number
    speechiness: number
    tempo: number
    valence: number
  }
}

export default Track
