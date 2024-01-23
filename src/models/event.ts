import { ObjectId } from 'bson'
import Track from './track'
import Artist from './artist'

export type EmbeddedEvent = Event & {
  _embedded?: {
    tracks: Track[]
    artists: Artist[]
  }
}
export type Event = {
  _id?: ObjectId // Will be the same as the ticketMasterId for the event.
  meanScore: number
  name: string
  imageUrl: string
  description: string
  tickets: {
    ticketeer: 'ticketmaster'
    venue: {
      city: string
      country: string
      address: string
      postalCode: string
      locationLon: number
      locationLat: number
    }
    ticketId: string
    ticketLink: string
    eventStartDate: Date
    eventEndData: Date
    ticketSaleStartDate: Date
    ticketSaleEndDate: Date
  }[]
}

export default Event
