import { ObjectId } from 'bson'
import Track from './track'
import Artist from './artist'

export type EmbeddedPlaylist = Playlist & {
  _embedded?: {
    tracks: Track[]
    artists: Artist[]
  }
}

export type Playlist = {
  _id: ObjectId // Will be the same as the spotify playlistId
  name: string
  imageUrl: string
  totalTracks: number
  meanScore: number
}

export default Playlist
