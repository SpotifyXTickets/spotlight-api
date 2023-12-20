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

export default class RecommendationsLogic {
  // Define empty data variables
  events: EmbeddedEvent[] = []
  eventsSimilarity: Array<Event & { similarity: number[] }> = []
  recommendedEvents: Array<Event & { matchScore: number }> = []
  userPlaylists: SpotifyPlaylistType[] = []
  // userTopArtists: SpotifyTopArtistType[] = []
  playlistWithTracks: Array<
    SpotifyPlaylistType & { tracksWithAudioData: Track[] }
  > = []
  artistPlaylistIds: string[] = []
  artistPlaylistIdsCount: { [key: string]: number } = {}
  tracks: SpotifyTopTrackType[] = []
  tracksWithAudioFeatures: Track[] = []

  public async fetchData(apiKey: string, playlistIds: string[]) {
    const spotifyLogic = new SpotifyLogic()
    const eventRepository = new EventRepository()

    // Fetch top artists from user
    // const tempTopArtists = await spotifyLogic.getUserTopArtists(apiKey)
    // if (!Array.isArray(tempTopArtists)) {
    //   throw new Error('No top artists found')
    // }
    // this.userTopArtists.push(tempTopArtists.map((artist) => artist))

    this.events = await eventRepository.getEvents()
    const playlists = await spotifyLogic.getPlaylists(apiKey)
    if (!Array.isArray(playlists)) {
      throw new Error('No playlists found')
    }
    this.userPlaylists = playlists

    for (const playlistKey in this.userPlaylists.filter(
      (p) => playlistIds.includes(p.id) || playlistIds.length === 0,
    ) as SpotifyPlaylistType[]) {
      // Get the playlist from the userPlaylists array.
      const playlist = (
        this.userPlaylists.filter(
          (p) => playlistIds.includes(p.id) || playlistIds.length === 0,
        ) as SpotifyPlaylistType[]
      )[playlistKey]

      // Fetch the tracks from the playlist.
      this.tracks = (await spotifyLogic.getPlaylistTracks(
        apiKey,
        playlist.id,
      )) as SpotifyTopTrackType[]

      // Clone the tracks array.
      const clonedTracks = Object.assign(
        [],
        this.tracks,
      ) as SpotifyTopTrackType[]

      while (clonedTracks.length > 0) {
        const tracksChunk = clonedTracks.splice(0, 100)

        for (let i = 0; i < tracksChunk.length; i++) {
          if (tracksChunk[i] == null) {
            continue
          }
          for (let j = 0; j < tracksChunk[i].artists.length; j++) {
            this.artistPlaylistIds.push(tracksChunk[i].artists[j].id)
          }
        }

        // Fetch the audio features from the tracks.
        const audioFeatures = await spotifyLogic.getTracksAudioFeatures(
          apiKey,
          tracksChunk.map((track) => track.id),
        )

        if (audioFeatures.length === 0) {
          continue
        }

        // Loop through each track and add it to the tracksWithAudioFeatures array.
        this.tracksWithAudioFeatures.push(
          ...tracksChunk.map((track) => {
            return transformSpotifyToTrack(
              track,
              audioFeatures
                .filter((a) => a !== null)
                .find((audioFeature) => {
                  return audioFeature.id === track.id
                }) as SpotifyAudioFeaturesType,
            )
          }),
        )
      }
      this.playlistWithTracks.push({
        ...playlist,
        tracksWithAudioData: this.tracksWithAudioFeatures,
      })
    }
  }

  public generateMeanScore(tracks: Track[]): number {
    // For each track, convert its features to valid numbers
    const scores = tracks.map((track) => {
      // Convert the track's features to valid numbers.
      const A: number[] = this.convertTrackToValidNumbers(track)
      let sumAiAi = 0
      // Calculate the sum of the track's features
      for (let i = 0; i < A.length; i++) {
        sumAiAi += A[i] * A[i]
      }
      return sumAiAi
    })
    let sumTotal = 0

    // Calculate the total sum of the scores.
    for (let i = 0; i < scores.length; i++) {
      sumTotal += scores[i]
    }

    // If the mean score is not a number (which can happen if the scores array is empty), return 0.
    if (Number.isNaN((sumTotal / scores.length) as number)) {
      {
        return 0
      }
    }
    return sumTotal / scores.length
  }

  // Performing scaling technique's in order to scale large values down to a value between 0 and 1
  private convertTrackToValidNumbers(track: Track): number[] {
    if ((track.audioData?.tempo as number) > 300) {
      console.log('Too low tempo ' + track.audioData?.tempo)
    }
    return [
      track.audioData?.danceability ? track.audioData?.danceability : 0,
      track.audioData?.energy ? track.audioData?.energy : 0,
      track.audioData?.loudness ? 1 - (track.audioData?.loudness + 60) / 60 : 0,
      track.audioData?.speechiness ? track.audioData?.speechiness : 0,
      track.audioData?.accousticness ? track.audioData?.accousticness : 0,
      track.audioData?.instrumentalness ? track.audioData?.instrumentalness : 0,
      track.audioData?.liveness ? track.audioData?.liveness : 0,
      track.audioData?.valence ? track.audioData?.valence : 0,
      track.audioData?.tempo ? track.audioData?.tempo / 300 : 0,
    ]
  }

  // Define the function to calculate cosine similarity
  public cosineSimilarity(A: number[], B: number[]): number {
    // Initialize the sums
    let sumAiBi = 0,
      sumAiAi = 0,
      sumBiBi = 0

    // Iterate over the elements of vectors A and B
    for (let i = 0; i < A.length; i++) {
      // Calculate the sum of Ai*Bi
      sumAiBi += A[i] * B[i]
      // Calculate the sum of Ai*Ai
      sumAiAi += A[i] * A[i]
      // Calculate the sum of Bi*Bi
      sumBiBi += B[i] * B[i]
    }

    // Calculate and return the cosine similarity
    return sumAiBi / Math.sqrt(sumAiAi * sumBiBi)
  }

  private sortArray(arr: string[], ascending: boolean = false) {
    // Reduce the array to an object where the keys are the unique items in the array
    // and the values are the counts of each item
    const result = arr.reduce(
      (result: { [key: string]: number }, item: any) => {
        // Get the current count of this item
        const count = result[item]

        // If the item doesn't exist in the result object yet, set its count to 1
        if (count === undefined) {
          result[item] = 1
        } else {
          // If the item does exist, increment its count
          result[item] += 1
        }

        // Return the result object for the next iteration
        return result
      },
      {},
    )

    // Convert the result object to an array of [item, count] pairs
    const entries = Object.entries(result)

    if (ascending) {
      // Sort the entries in ascending order of count
      const sorted = entries.sort((entryA, entryB) => entryA[1] - entryB[1])

      return sorted
    } else {
      // Sort the entries in descending order of count
      const sorted = entries.sort((entryA, entryB) => entryB[1] - entryA[1])
      return sorted
    }
  }

  private compareByMatchScore(a: any, b: any) {
    return b.matchScore - a.matchScore
  }

  private async recommendEventLayerOne() {
    const sortedArtistIdCount = this.sortArray(this.artistPlaylistIds, false)

    for (let i = 0; i < sortedArtistIdCount.length; i++) {
      const artistId = sortedArtistIdCount[i][0]
      const artistEvent = this.events
        .filter((s) => s._embedded!.artists.length !== 0)
        .find(
          (event) =>
            event._embedded!.artists[0].spotifyId?.toString() === artistId,
        )
      if (artistEvent) {
        // Add the event to the recommendations
        this.recommendedEvents.push({ ...artistEvent, matchScore: 1 })

        // Remove the recommended event from the events array
        this.events = this.events.filter((event) => event !== artistEvent)
      }
    }
  }

  private async recommendEventLayerTwo() {
    const recommendedEventsLayerTwo: Array<Event & { matchScore: number }> = []

    for (const eventKey in this.events) {
      const event = this.events[eventKey]

      if (event._embedded === undefined) {
        continue
      }

      const eventTracks = event._embedded.tracks
      let eventTracksSum = [0, 0, 0, 0, 0, 0, 0, 0, 0]
      let playlistTracksSum = [0, 0, 0, 0, 0, 0, 0, 0, 0]

      // Loop through each track in the event tracks and add it to the eventTracksSum array.
      for (let i = 0; i < eventTracks.length; i++) {
        const featureNumbers = this.convertTrackToValidNumbers(eventTracks[i])
        for (let j = 0; j < featureNumbers.length; j++) {
          eventTracksSum[j] += featureNumbers[j]
        }
      }

      // Loop through each track in the playlist tracks and add it to the playlistTracksSum array.
      for (let i = 0; i < this.tracksWithAudioFeatures.length; i++) {
        const featureNumbers = this.convertTrackToValidNumbers(
          this.tracksWithAudioFeatures[i],
        )
        for (let j = 0; j < featureNumbers.length; j++) {
          playlistTracksSum[j] += featureNumbers[j]
        }
      }

      // Calculate the average of the eventTracksSum and playlistTracksSum arrays.
      eventTracksSum = eventTracksSum.map((value) => {
        return value / eventTracks.length
      })

      playlistTracksSum = playlistTracksSum.map((value) => {
        return value / this.tracksWithAudioFeatures.length
      })

      // Calculate the similarity between the eventTracksSum and playlistTracksSum arrays.
      let similarity = this.cosineSimilarity(eventTracksSum, playlistTracksSum)

      // If the similarity is not a number, set it to 0.
      if (Number.isNaN(similarity)) {
        similarity = 0
      }

      recommendedEventsLayerTwo.push({ ...event, matchScore: similarity })
    }

    recommendedEventsLayerTwo.sort(this.compareByMatchScore)
    this.recommendedEvents.push(...recommendedEventsLayerTwo)
  }

  private async recommendEventLayerThree() {
    // console.log(this.userTopArtists.id)
  }

  public async recommendEvent(
    apiKey: string,
    playlistIds: string[],
  ): Promise<Array<Event & { matchScore: number }>> {
    await this.fetchData(apiKey, playlistIds)

    await this.recommendEventLayerOne()
    await this.recommendEventLayerTwo()
    await this.recommendEventLayerThree()

    this.recommendedEvents.sort(this.compareByMatchScore)

    return this.recommendedEvents
  }
}
