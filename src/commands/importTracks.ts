import { DB } from '../db'
import isErrorResponse from '../helpers/isErrorResponse'
import SpotifyLogic from '../logics/spotifyLogic'
import { EmbeddedArtist } from '../models/artist'
import Track from '../models/track'
import { ArtistRepository } from '../repositories/artistRepository'
import { transformSpotifyToTrack } from '../transformers/transformSpotifyToTrack'
import {
  SpotifyAudioFeaturesType,
  SpotifyTopTrackType,
} from '../types/spotifyTypes'
import { obtainBackendToken } from './createBackendToken'
import dotenv from 'dotenv'

dotenv.config()

export async function importTracks(
  apiKey: string,
  embeddedArtists: EmbeddedArtist[],
): Promise<EmbeddedArtist[]> {
  const spotifyLogic = new SpotifyLogic()

  const spotifyTracks: {
    artist: EmbeddedArtist
    topTracks: SpotifyTopTrackType[]
  }[] = []
  for (const artist of embeddedArtists) {
    if (artist.spotifyId === undefined) {
      continue
    }
    const tracks = await spotifyLogic.getTopTracksOfArtist(
      apiKey,
      artist.spotifyId,
    )

    if (isErrorResponse(tracks)) {
      continue
    }
    spotifyTracks.push({
      artist: artist,
      topTracks: tracks,
    })
  }

  const audioData: SpotifyAudioFeaturesType[] = []
  const spotifyTopTracks = spotifyTracks
    .map((st) => {
      return st.topTracks
    })
    .flat()
  while (spotifyTopTracks.length > 0) {
    const spotifyTracksChunk = spotifyTopTracks.splice(0, 100)

    const audioFeatures = await spotifyLogic.getTracksAudioFeatures(
      apiKey,
      spotifyTracksChunk.map((st) => {
        return st.id
      }),
    )

    audioData.push(...audioFeatures)
  }

  return embeddedArtists.map((ea) => {
    const trs = spotifyTracks
      .filter((st) => {
        return st.artist.spotifyId === ea.spotifyId
      })
      .map((st) => {
        const tr = st.topTracks
          .map((tt) => {
            const audioFeature = audioData.find((ad) => ad.id === tt.id)
            if (audioFeature === undefined) {
              return undefined
            }
            return transformSpotifyToTrack(tt, audioFeature)
          })
          .filter((tt) => tt !== undefined) as Track[]
        return tr
      })
    return {
      ...ea,
      _embedded: {
        events: ea._embedded?.events ?? [],
        tracks: trs.flat(),
      },
    }
  })
}

;(async () => {
  try {
    if (require.main !== module) return
    await DB.connect()

    const args = process.argv.slice(0, 1)

    const artistRepository = new ArtistRepository()

    const artist = await artistRepository.getArtistBySpotifyId(args[0])

    if (artist === false) {
      console.error('Artist not found!')
      process.exit(1)
      return
    }

    const db = await DB.getDB()
    await obtainBackendToken(db, async (apiKey) => {
      await importTracks(apiKey, [artist as EmbeddedArtist])
    })
  } catch (error) {
    console.log(error)
  }
  process.exit(1)
})()
