import { ObjectId } from 'bson'
import Track from './track'
import Event from './event'

export type EmbeddedArtist = Artist & {
  _embedded?: {
    tracks: Track[]
    events: Event[]
  }
}

export type Artist = {
  _id: ObjectId
  spotifyId?: string
  ticketMasterId?: string
  genres: string[]
  name: string
  imageUrl: string
  meanScore: number
  socialMedia: {
    website?: string
    facebook?: string
    twitter?: string
    instagram?: string
    youtube?: string
    spotify?: string
    lastfm?: string
  }
}

export default Artist
