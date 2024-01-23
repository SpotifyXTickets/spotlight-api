import { EventRepository } from './../repositories/eventRepository'
import { DB } from '../db'
import { Event } from '../models/event'
import { obtainBackendToken } from './createBackendToken'
import { importArtistsFromSpotify } from './importArtists'
import { importTMEvents } from './importEvents'
import { importTracks } from './importTracks'
import { ArtistRepository } from '../repositories/artistRepository'
import { uniqBy } from '../helpers/uniqBy'

export async function importData(apiKey: string) {
  const events = await importTMEvents(apiKey)
  const artistAndEvents = await importArtistsFromSpotify(apiKey, events)

  const tracks = await importTracks(apiKey, artistAndEvents.embeddedArtist)

  const eventRepository = new EventRepository()
  const artistRepository = new ArtistRepository()

  for (const e of artistAndEvents.embeddedEvent) {
    const ts = e._embedded
      ? e._embedded.artists
          .map((ea) => {
            const t = tracks.find((t) => t._id === ea._id)
            if (t === undefined) {
              return []
            }
            return t._embedded ? t._embedded.tracks : []
          })
          .flat()
      : []

    await eventRepository.updateEvent({
      ...e,
      _embedded: {
        artists: [...new Set(e._embedded!.artists)],
        tracks: [...new Set(ts)],
      },
    })
  }

  for (const a of tracks) {
    await artistRepository.updateArtist({
      ...a,
      _embedded: {
        events: [
          ...uniqBy<Event>(a._embedded ? a._embedded.events : [], 'name'),
        ],
        tracks: [...new Set(a._embedded!.tracks)],
      },
    })
  }
  console.log(tracks)
}

;(async () => {
  try {
    if (require.main !== module) return
    await DB.connect()

    const db = await DB.getDB()
    await obtainBackendToken(db, async (apiKey) => {
      await importData(apiKey)
    })
  } catch (error) {
    console.log(error)
  }
  process.exit(1)
})()
