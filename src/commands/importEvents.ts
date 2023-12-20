import { DB } from '../db/db'
import TicketMasterLogic from '../logics/ticketMasterLogic'
import { EmbeddedEvent } from '../models/event'
import { EventRepository } from '../repositories/eventRepository'
import { transformTicketMasterToEvent } from '../transformers/eventTransformers'
import { TicketMasterEventType } from '../types/ticketMasterTypes'
import { obtainBackendToken } from './createBackendToken'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function importTMEvents(apiKey: string): Promise<
  {
    embeddedEvent: EmbeddedEvent
    tmArtists: TicketMasterEventType['_embedded']['attractions']
  }[]
> {
  const ticketMasterLogic = new TicketMasterLogic()
  const eventRepository = new EventRepository()

  const tmEvents = await ticketMasterLogic.getAllEvents()

  if (tmEvents === undefined) {
    console.log('No events found')
    return []
  }

  const url = tmEvents.links.last.href
  const urlParams = new URLSearchParams(url)
  let page = urlParams.get('page') as unknown as number
  page = page > 5 ? 5 : page

  for (let i = 1; i < page; i++) {
    tmEvents.events.push(
      ...(await ticketMasterLogic.getAllEvents(200, i))!.events,
    )
  }

  const dbEvents = await eventRepository.getEvents()

  const eventsToCreate = tmEvents.events
    .filter((e) => {
      const eev = dbEvents.find((de) => {
        const dbev = de.tickets.find((t) => {
          return t.ticketId == e.id
        })

        return dbev !== undefined
      })
      return eev === undefined
    })
    .filter((e) => {
      return e._embedded.venues[0].address !== undefined
    })
    .sort((a, b) => {
      if (a.name.toLocaleLowerCase() !== b.name.toLocaleLowerCase()) {
        return a.name.length - b.name.length
      }
      if (a.sales?.public?.startDateTime !== b.sales?.public?.startDateTime) {
        return a.sales?.public?.startDateTime.localeCompare(
          b.sales?.public?.startDateTime,
        )
      }
      return 0
    })

  const eventsInDb: TicketMasterEventType[][] = []

  for (const eventToCreate of eventsToCreate) {
    //Attempts to find event in DB with same name as event
    const event = eventsInDb.flat().find((e) => {
      return (
        e.name
          .toLocaleLowerCase()
          .includes(eventToCreate.name.toLocaleLowerCase()) ||
        eventToCreate.name
          .toLocaleLowerCase()
          .includes(e.name.toLocaleLowerCase())
      )
      //Check if tmevent is in the same day and location as already existing event
    }) as TicketMasterEventType | undefined

    if (event !== undefined) {
      eventsInDb.forEach((es, i) => {
        if (
          es.find((e) =>
            e.name
              .toLocaleLowerCase()
              .includes(eventToCreate.name.toLocaleLowerCase()),
          )
        ) {
          eventsInDb[i].push(eventToCreate)
        }
      })
      continue
    }

    // Event [0 => EmbeddedEvent[]]

    eventsInDb.push([eventToCreate])
  }

  const exportableEvents: EmbeddedEvent[] = []
  for (const e of eventsInDb) {
    const embeddedEvent = transformTicketMasterToEvent(e)
    embeddedEvent.tickets.sort((a, b) => {
      return a.eventStartDate.getTime() - b.eventStartDate.getTime()
    })
    try {
      await eventRepository.createEvent(embeddedEvent)
    } catch (error) {
      await eventRepository.updateEvent(embeddedEvent)
    }
    exportableEvents.push(embeddedEvent)
  }

  return [
    ...exportableEvents.map((e) => {
      return {
        embeddedEvent: e,
        tmArtists:
          tmEvents.events.find((te) => {
            return te.id === e.tickets[0].ticketId
          })?._embedded.attractions ?? [],
      }
    }),
    ...dbEvents.map((e) => {
      return {
        embeddedEvent: e,
        tmArtists:
          tmEvents.events.find((te) => {
            return te.id === e.tickets[0].ticketId
          })?._embedded.attractions ?? [],
      }
    }),
  ]
}
;(async () => {
  try {
    if (require.main !== module) return
    await DB.connect()

    const db = await DB.getDB()
    await obtainBackendToken(db, async (apiKey) => {
      await importTMEvents(apiKey)
    })
  } catch (error) {
    console.log(error)
  }
  process.exit(1)
})()
