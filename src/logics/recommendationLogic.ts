/* eslint-disable @typescript-eslint/no-explicit-any */
// TO-DO integrate minmax scaling

import Track from '../models/track'
import { EventRepository } from '../repositories/eventRepository'
import {
  SpotifyAudioFeaturesType,
  SpotifyPlaylistType,
  // SpotifyTopArtistType,
  SpotifyTopTrackType,
} from '../types/spotifyTypes'
import SpotifyLogic from './spotifyLogic'
import Event, { EmbeddedEvent } from '../models/event'
import { transformSpotifyToTrack } from '../transformers/trackTransformers'
import { Service } from 'typedi'
import 'reflect-metadata'

@Service()
export default class RecommendationLogic {
  private recommendedEvents: Array<Event & { matchScore: number }> = []
  private events: EmbeddedEvent[] = []
  private userPlaylists: SpotifyPlaylistType[] = []
  private playlistWithTracks: Array<{
    tracksWithAudioData: Track[]
  }> = []
  private artistPlaylistIds: string[] = []
  private tracksWithAudioFeatures: Track[] = []

  public async fetchData(apiKey: string, playlistIds: string[]) {
    const spotifyLogic = new SpotifyLogic()
    const eventRepository = new EventRepository()

    const [events, playlists] = await Promise.all([
      eventRepository.getEvents(),
      spotifyLogic.getPlaylists(apiKey),
    ])

    if (!Array.isArray(playlists)) {
      throw new Error('No playlists found')
    }

    console.log('Recieved events: ', events.length)
    console.log('Recieved playlists: ', playlists.length)
    this.events = events
    this.userPlaylists = playlists

    const filteredPlaylists = this.userPlaylists.filter(
      (p) => playlistIds.includes(p.id) || playlistIds.length === 0,
    ) as SpotifyPlaylistType[]

    await Promise.all(
      filteredPlaylists.map(async (playlist) => {
        const tracks = await spotifyLogic.getPlaylistTracks(apiKey, playlist.id)

        if (tracks === false) {
          throw new Error('No tracks found')
        }

        const clonedTracks = [
          ...(tracks as SpotifyTopTrackType[]),
        ] as SpotifyTopTrackType[]

        while (clonedTracks.length > 0) {
          const tracksChunk = clonedTracks.splice(0, 100)

          tracksChunk.forEach((track) => {
            if (track == null) {
              return
            }
            track.artists.forEach((artist) => {
              this.artistPlaylistIds.push(artist.id)
            })
          })

          const audioFeatures = (
            await spotifyLogic.getTracksAudioFeatures(
              apiKey,
              tracksChunk.map((track) => track.id),
            )
          ).filter((af) => af !== null) as SpotifyAudioFeaturesType[]

          if (audioFeatures.length === 0) {
            continue
          }

          const tracksWithAudioFeatures = tracksChunk.filter((t) =>
            audioFeatures.some((audioFeature) => audioFeature.id === t.id),
          )

          const transformedTracks = tracksWithAudioFeatures.map((track) =>
            transformSpotifyToTrack(
              track,
              audioFeatures.find(
                (audioFeature) => audioFeature.id === track.id,
              ) as SpotifyAudioFeaturesType,
            ),
          )

          this.tracksWithAudioFeatures.push(...transformedTracks)
        }

        this.playlistWithTracks.push({
          ...playlist,
          tracksWithAudioData: this.tracksWithAudioFeatures,
        })
      }),
    )
  }

  public generateMeanScore(tracks: Track[]): number {
    const scores = tracks.map((track) => {
      const A: number[] = this.convertTrackToValidNumbers(track)
      const sumAiAi = A.reduce((sum, value) => sum + value * value, 0)
      return sumAiAi
    })

    const sumTotal = scores.reduce((sum, value) => sum + value, 0)
    const meanScore = sumTotal / scores.length

    return Number.isNaN(meanScore) ? 0 : meanScore
  }

  private convertTrackToValidNumbers(track: Track): number[] {
    return [
      track.audioData?.danceability ?? 0,
      track.audioData?.energy ?? 0,
      track.audioData?.loudness ? 1 - (track.audioData?.loudness + 60) / 60 : 0,
      track.audioData?.speechiness ?? 0,
      track.audioData?.accousticness ?? 0,
      track.audioData?.instrumentalness ?? 0,
      track.audioData?.liveness ?? 0,
      track.audioData?.valence ?? 0,
      track.audioData?.tempo ? track.audioData?.tempo / 300 : 0,
    ]
  }

  public cosineSimilarity(A: number[], B: number[]): number {
    const sumAiBi = A.reduce((sum, value, index) => sum + value * B[index], 0)
    const sumAiAi = A.reduce((sum, value) => sum + value * value, 0)
    const sumBiBi = B.reduce((sum, value) => sum + value * value, 0)

    return sumAiBi / Math.sqrt(sumAiAi * sumBiBi)
  }

  private sortArray(arr: string[], ascending: boolean = false) {
    const result: { [key: string]: number } = arr.reduce(
      (result, item) => {
        result[item] = (result[item] ?? 0) + 1
        return result
      },
      {} as { [key: string]: number },
    )

    const entries = Object.entries(result)

    if (ascending) {
      return entries.sort((entryA, entryB) => entryA[1] - entryB[1])
    } else {
      return entries.sort((entryA, entryB) => entryB[1] - entryA[1])
    }
  }

  private compareByMatchScore(a: any, b: any) {
    return b.matchScore - a.matchScore
  }

  private async recommendEventLayerOne() {
    const sortedArtistIdCount = this.sortArray(this.artistPlaylistIds, false)

    sortedArtistIdCount.forEach(([artistId]) => {
      const artistEvent = this.events
        .filter((event) => {
          if (event._embedded === undefined) {
            return false
          }

          if (event._embedded?.artists[0] === undefined) {
            return false
          }

          return true
        })
        .find(
          (event) =>
            event._embedded?.artists[0].spotifyId?.toString() === artistId,
        )

      if (artistEvent) {
        this.recommendedEvents.push({ ...artistEvent, matchScore: 1 })
        this.events = this.events.filter((event) => event !== artistEvent)
      }
    })
  }

  private async recommendEventLayerTwo() {
    const recommendedEventsLayerTwo: Array<
      EmbeddedEvent & { matchScore: number }
    > = []

    for (const event of this.events) {
      if (event._embedded === undefined) {
        continue
      }

      const eventTracks = event._embedded.tracks
      const eventTracksSum = eventTracks.reduce(
        (sum, track) => {
          const featureNumbers = this.convertTrackToValidNumbers(track)
          return sum.map((value, index) => value + featureNumbers[index])
        },
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      )

      const playlistTracksSum = this.tracksWithAudioFeatures.reduce(
        (sum, track) => {
          const featureNumbers = this.convertTrackToValidNumbers(track)
          return sum.map((value, index) => value + featureNumbers[index])
        },
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      )

      const eventTracksAvg = eventTracksSum.map(
        (value) => value / eventTracks.length,
      )
      const playlistTracksAvg = playlistTracksSum.map(
        (value) => value / this.tracksWithAudioFeatures.length,
      )

      let similarity = this.cosineSimilarity(eventTracksAvg, playlistTracksAvg)
      similarity = Number.isNaN(similarity) ? 0 : similarity

      recommendedEventsLayerTwo.push({ ...event, matchScore: similarity })
    }

    recommendedEventsLayerTwo.sort(this.compareByMatchScore)
    this.recommendedEvents.push(...recommendedEventsLayerTwo)
  }

  private async recommendEventLayerThree() {
    // TODO: Implement layer three recommendation logic
  }

  public async recommendEvent(
    apiKey: string,
    playlistIds: string[],
    size: number = 30,
  ): Promise<Array<Event & { matchScore: number }>> {
    await this.fetchData(apiKey, playlistIds)

    await Promise.all([
      this.recommendEventLayerOne(),
      this.recommendEventLayerTwo(),
      this.recommendEventLayerThree(),
    ])

    const sortedEvents = this.recommendedEvents.sort(this.compareByMatchScore)
    const recommendedEvents = sortedEvents.slice(0, size)

    return recommendedEvents
  }
}
