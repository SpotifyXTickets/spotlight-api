import { TicketMasterEventType } from '../types/ticketMasterTypes'
import Event, { EmbeddedEvent } from '../models/event'
import Artist from '../models/artist'
import Track from '../models/track'

export function transformTicketMasterToEvent(
  ticketMasterEvent: TicketMasterEventType[],
): Event {
  const originalEvent = ticketMasterEvent.sort(
    (a, b) => a.name.length - b.name.length,
  )[0]

  if (
    ticketMasterEvent.find((e) => e._embedded.venues[0].address === undefined)
  ) {
    console.log(ticketMasterEvent)
  }
  return {
    name: originalEvent.name,
    description: originalEvent.description,
    imageUrl: originalEvent.images[0].url,
    meanScore: 0,
    tickets: ticketMasterEvent.map((event) => ({
      ticketeer: 'ticketmaster',
      venue: {
        city: event._embedded.venues[0].city.name,
        country: event._embedded.venues[0].country.name,
        address: event._embedded.venues[0].address.line1,
        postalCode: event._embedded.venues[0].postalCode,
        locationLon: event._embedded.venues[0].location.longitude,
        locationLat: event._embedded.venues[0].location.latitude,
      },
      ticketId: event.id,
      ticketLink: event.url,
      eventStartDate: new Date(event.dates.start.dateTime),
      eventEndData: new Date(
        event.dates.end ? event.dates.end.dateTime : event.dates.start.dateTime,
      ),
      ticketSaleStartDate: new Date(event.sales.public.startDateTime),
      ticketSaleEndDate: new Date(event.sales.public.endDateTime),
    })),
  } as Event
}

export function transformEventToEmbeddedEvent(
  event: Event,
  tracks: Track[],
  artists: Artist[],
): EmbeddedEvent {
  return {
    ...event,
    _embedded: {
      tracks,
      artists,
    },
  } as EmbeddedEvent
}

export function transformEmbeddedEventToEvent(event: EmbeddedEvent): Event {
  return { ...event, _embedded: undefined } as Event
}
