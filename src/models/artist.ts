import { ObjectId } from 'bson'
import Track from './track'
import Event from './event'
// import { SpotifyArtistType } from '../types/spotifyTypes'
// import { TicketMasterArtistType } from '../types/ticketMasterTypes'
// import Track from './track'

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

// export class Artist {
//   _id?: ObjectId
//   spotifyId?: string
//   ticketMasterId?: string
//   name: string
//   imageUrl: string
//   meanScore: number
//   website?: string
//   facebook?: string
//   twitter?: string
//   instagram?: string
//   youtube?: string
//   spotify?: string
//   lastfm?: string
//   _embedded?: {
//     tracks: Track[]
//   }

//   constructor(
//     spotifyArtistData?: SpotifyArtistType | null,
//     ticketMasterArtistData?: TicketMasterArtistType | null,
//   ) {
//     this.spotifyId = spotifyArtistData ? spotifyArtistData.id : undefined
//     this.ticketMasterId = ticketMasterArtistData
//       ? ticketMasterArtistData.id
//       : undefined
//     this.name = spotifyArtistData
//       ? spotifyArtistData.name
//       : ticketMasterArtistData
//         ? ticketMasterArtistData.name
//         : ''
//     this.imageUrl = spotifyArtistData
//       ? spotifyArtistData.images[0].url
//       : ticketMasterArtistData
//         ? ticketMasterArtistData.images[0].url
//         : ''
//     this.meanScore = 0
//     this.website = ticketMasterArtistData ? ticketMasterArtistData.url : ''
//     this.facebook = ticketMasterArtistData
//       ? ticketMasterArtistData.externalLinks.facebook
//         ? ticketMasterArtistData.externalLinks.facebook[0].url
//         : ''
//       : ''
//     this.twitter = ticketMasterArtistData
//       ? ticketMasterArtistData.externalLinks.twitter
//         ? ticketMasterArtistData.externalLinks.twitter[0].url
//         : ''
//       : ''
//     this.instagram = ticketMasterArtistData
//       ? ticketMasterArtistData.externalLinks.instagram
//         ? ticketMasterArtistData.externalLinks.instagram[0].url
//         : ''
//       : ''
//     this.youtube = ticketMasterArtistData
//       ? ticketMasterArtistData.externalLinks.youtube
//         ? ticketMasterArtistData.externalLinks.youtube[0].url
//         : ''
//       : ''
//     this.spotify = ticketMasterArtistData
//       ? ticketMasterArtistData.externalLinks.spotify
//         ? ticketMasterArtistData.externalLinks.spotify[0].url
//         : ''
//       : ''
//     this.lastfm = ticketMasterArtistData
//       ? ticketMasterArtistData.externalLinks.lastfm
//         ? ticketMasterArtistData.externalLinks.lastfm[0].url
//         : ''
//       : ''
//   }

//   public setMeanScore(score: number) {
//     this.meanScore = score
//     return
//   }
// }

export default Artist
