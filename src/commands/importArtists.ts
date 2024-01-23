import { ArtistRepository } from './../repositories/artistRepository'
import SpotifyLogic from '../logics/spotifyLogic'
import { EmbeddedEvent } from '../models/event'
import {
  TicketMasterArtistType,
  TicketMasterEventType,
} from '../types/ticketMasterTypes'
import {
  transformEmbeddedArtistToArtist,
  transformSpotifyAndTicketmasterToArtist,
} from '../transformers/artistTransformers'
import { SpotifyArtistType } from '../types/spotifyTypes'
import { EmbeddedArtist } from '../models/artist'
import { DB } from '../db'
import { obtainBackendToken } from './createBackendToken'
import { EventRepository } from '../repositories/eventRepository'
import isErrorResponse from '../helpers/isErrorResponse'
import TicketMasterLogic from '../logics/ticketMasterLogic'
import { transformEmbeddedEventToEvent } from '../transformers/eventTransformers'

//Repositories used for import..

//Logics used for import..

export async function importArtistsFromSpotify(
  apiKey: string,
  eventWithArtists: Array<{
    embeddedEvent: EmbeddedEvent
    tmArtists: TicketMasterEventType['_embedded']['attractions']
  }>,
): Promise<{
  embeddedEvent: Array<EmbeddedEvent>
  embeddedArtist: Array<EmbeddedArtist>
}> {
  const spotifyLogic = new SpotifyLogic()
  const artistRepository = new ArtistRepository()
  const artists: EmbeddedArtist[] = []
  const tmArtists: TicketMasterEventType['_embedded']['attractions'] = []
  try {
    //Collects all artists from the events.
    for (const ae of eventWithArtists) {
      tmArtists.push(...ae.tmArtists)
    }

    //Gets artist spotifyUrls
    const tmArtistsWithSpotifyId = [
      ...new Set(
        tmArtists
          .filter((artist) => artist.externalLinks !== undefined)
          .filter((artist) => artist.externalLinks.spotify !== undefined)
          .map((artist) => {
            // Gets the spotify url from the external links.
            return {
              tmArtist: artist,
              spotifyUrl: artist.externalLinks.spotify![0].url,
            }
          })
          .map((a) => {
            // Gets the spotify id from the url.
            const spotifyId = a.spotifyUrl.split('/').pop()
            return {
              tmArtist: a.tmArtist,
              spotifyId:
                spotifyId?.substring(
                  0,
                  spotifyId.indexOf('?') === -1
                    ? spotifyId.length
                    : spotifyId.indexOf('?'),
                ) ?? '',
            }
          }),
      ),
    ]

    //Chunk artists to sizes of 50 because of spotify API limit.
    const tmArtistsChunked: {
      tmArtist: TicketMasterArtistType
      spotifyId: string
    }[][] = []
    while (tmArtistsWithSpotifyId.length > 0) {
      tmArtistsChunked.push(tmArtistsWithSpotifyId.splice(0, 50))
    }

    for (const tma of tmArtistsChunked) {
      const dbTmaArtists = await artistRepository.getArtistsBySpotifyIds(
        tma.map((a) => a.spotifyId),
      )

      const spotifyArtists = await spotifyLogic.getArtistsByIds(
        apiKey,
        tma
          .filter((a) => {
            return (
              dbTmaArtists.find((da) => da.spotifyId === a.spotifyId) ===
              undefined
            )
          })
          .map((a) => a.spotifyId),
      )

      const transformParams = (spotifyArtists as SpotifyArtistType[]).map<{
        spotifyArtist: SpotifyArtistType
        tmArtist: TicketMasterArtistType
      }>((sa) => {
        return {
          spotifyArtist: sa,
          tmArtist: tma.find((a) => a.spotifyId === sa.id)!.tmArtist,
        }
      })

      transformParams.forEach((tp) => {
        artists.push(
          transformSpotifyAndTicketmasterToArtist(
            tp.spotifyArtist,
            tp.tmArtist,
          ),
        )
      })
    }

    const dbArtists = await artistRepository.getArtistsBySpotifyIds(
      tmArtistsChunked.flat().map((a) => a.spotifyId),
    )

    const artistsToCreate = artists.filter(
      (a) => dbArtists.find((da) => da.spotifyId === a.spotifyId) === undefined,
    )

    for (let a of artistsToCreate) {
      a = (await artistRepository.createArtist(a)) as EmbeddedArtist
      dbArtists.push(a)
      // artist._embedded?.events?.push(transformEmbeddedEventToEvent(event))
    }

    const artistsToUpdate: EmbeddedArtist[] = []
    const eventsToUpdate: EmbeddedEvent[] = []

    for (const e of eventWithArtists.map((ea) => {
      return ea.embeddedEvent
    })) {
      const dbe = eventWithArtists.find((ea) => {
        return ea.embeddedEvent._id === e._id
      })

      if (dbe === undefined) {
        continue
      }

      const a = dbe.tmArtists
        .map((a) => {
          const sa = dbArtists.find((da) => {
            return da.ticketMasterId === a.id
          })
          return sa ? sa : undefined
        })
        .filter((a) => a !== undefined) as EmbeddedArtist[]

      e._embedded =
        e._embedded === undefined
          ? {
              artists: [],
              tracks: [],
            }
          : {
              artists: e._embedded.artists,
              tracks: e._embedded.tracks,
            }

      e._embedded.artists.push(
        ...a.map((a) => transformEmbeddedArtistToArtist(a)),
      )

      eventsToUpdate.push(e)
      const artistIndex = artistsToUpdate.findIndex(
        (au) =>
          a.find((adb) => {
            return adb._id === au._id
          }) !== undefined,
      )

      if (artistIndex === -1) {
        artistsToUpdate.push(
          ...a.map((ar) => {
            return {
              ...ar,
              _embedded: {
                events: [
                  ...(ar._embedded ? ar._embedded.events : []),
                  transformEmbeddedEventToEvent(e),
                ],
                tracks: [...(ar._embedded ? ar._embedded.tracks : [])],
              },
            }
          }),
        )
      } else {
        const isEmbedded = artistsToUpdate[artistIndex]._embedded !== undefined
        const embeddedEvents = artistsToUpdate[artistIndex]._embedded!.events

        const embeddedTracks = artistsToUpdate[artistIndex]._embedded!.tracks
        artistsToUpdate[artistIndex]._embedded = isEmbedded
          ? {
              events:
                embeddedEvents.find((ee) => {
                  return ee._id?.toString() === e._id?.toString()
                }) !== undefined
                  ? [...embeddedEvents, transformEmbeddedEventToEvent(e)]
                  : embeddedEvents,
              tracks: embeddedTracks,
            }
          : {
              events: [transformEmbeddedEventToEvent(e)],
              tracks: [],
            }
      }
    }

    // event._embedded?.artists?.push(...artists)

    return {
      embeddedEvent: eventsToUpdate,
      embeddedArtist: artistsToUpdate,
    }

    console.log('Artists imported successfully!')
  } catch (error) {
    console.error('Error importing artists:', error)
    return {
      embeddedEvent: [],
      embeddedArtist: [],
    }
  }
}

;(async () => {
  try {
    if (require.main !== module) return
    await DB.connect()
    const db = await DB.getDB()

    const args = process.argv.slice(0, 1)

    const eventRepository = new EventRepository()
    const ticketMasterLogic = new TicketMasterLogic()

    const event = await eventRepository.getEventByTicketMasterId(args[0])

    if (isErrorResponse(event)) {
      console.error(event)
      return
    }

    const tmArtists = await ticketMasterLogic.getTMArtistsByEventId(
      event.tickets[0].ticketId,
    )

    if (isErrorResponse(tmArtists)) {
      console.error(tmArtists)
      return
    }

    await obtainBackendToken(db, async (apiKey) => {
      await importArtistsFromSpotify(apiKey, [
        { embeddedEvent: event, tmArtists: tmArtists },
      ])
    })
  } catch (error) {
    console.log(error)
  }
})()
