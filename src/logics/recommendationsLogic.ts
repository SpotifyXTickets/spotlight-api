import Track from '../models/track'
import { EventRepository } from '../repositories/eventRepository'
import {
  SpotifyAudioFeaturesType,
  SpotifyPlaylistType,
  SpotifyTopTrackType,
} from '../types/spotifyTypes'
import SpotifyLogic from './spotifyLogic'
import Event from '../models/event'
import { transformSpotifyToTrack } from '../transformers/transformSpotifyToTrack'

export default class RecommendationsLogic {
  private playlist: number[]
  private events: { [key: string]: number[] }

  constructor(playlist?: number[], events?: { [key: string]: number[] }) {
    this.playlist = playlist ?? []
    this.events = events ? events : {}
  }

  public generateMeanScore(tracks: Track[]): number {
    // For each track, convert its features to valid numbers
    const scores = tracks.map((track) => {
      const A: number[] = this.convertTrackToValidNumbers(track)
      let sumAiAi = 0
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
      ...(track.audioData
        ? [
            track.audioData.danceability,
            track.audioData.energy,
            1 - (track.audioData.loudness! + 60) / 60,
            track.audioData.speechiness,
            track.audioData.accousticness,
            track.audioData.instrumentalness,
            track.audioData.liveness,
            track.audioData.valence,
            track.audioData.tempo / 300,
          ]
        : [0, 0, 0, 0, 0, 0, 0, 0, 0]),
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

  public async recommendEvent(
    apiKey: string,
    playlistIds: string[],
  ): Promise<Array<Event & { matchScore: number }>> {
    const spotifyLogic = new SpotifyLogic()
    const eventRepository = new EventRepository()
    const eventsSimilarity: Array<Event & { similarity: number[] }> = []

    const events = await eventRepository.getEvents()

    // Fetch the user's playlists from Spotify using the provided API key
    let userPlaylists = await spotifyLogic.getPlaylists(apiKey)

    // If no playlists were found, throw an error.
    if (!userPlaylists) {
      throw new Error('No playlists found')
    }

    userPlaylists = userPlaylists as SpotifyPlaylistType[]
    const playlistWithTracks: Array<
      SpotifyPlaylistType & { tracksWithAudioData: Track[] }
    > = []

    // const scorePlaylists;
    for (const playlistKey in userPlaylists.filter(
      (p) => playlistIds.includes(p.id) || playlistIds.length === 0,
    ) as SpotifyPlaylistType[]) {
      const playlist = (
        userPlaylists.filter(
          (p) => playlistIds.includes(p.id) || playlistIds.length === 0,
        ) as SpotifyPlaylistType[]
      )[playlistKey]
      const tracks = (await spotifyLogic.getPlaylistTracks(
        apiKey,
        playlist.id,
      )) as SpotifyTopTrackType[]
      const tracksWithAudioFeatures: Track[] = []
      const clonedTracks = Object.assign([], tracks) as SpotifyTopTrackType[]
      // while (clonedTracks.length > 0) {
      const tracksChunk = clonedTracks.splice(0, 100)
      const audioFeatures = await spotifyLogic.getTracksAudioFeatures(
        apiKey,
        tracksChunk.map((track) => track.id),
      )

      if (audioFeatures.length === 0) {
        continue
      }

      // Loop through each track and add it to the tracksWithAudioFeatures array.
      tracksWithAudioFeatures.push(
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
      // }

      playlistWithTracks.push({
        ...playlist,
        tracksWithAudioData: tracksWithAudioFeatures,
      })

      for (const eventKey in events) {
        const event = events[eventKey]
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
        for (let i = 0; i < tracksWithAudioFeatures.length; i++) {
          const featureNumbers = this.convertTrackToValidNumbers(
            tracksWithAudioFeatures[i],
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
          return value / tracksWithAudioFeatures.length
        })

        // Calculate the similarity between the eventTracksSum and playlistTracksSum arrays.
        let similarity = this.cosineSimilarity(
          eventTracksSum,
          playlistTracksSum,
        )

        // If the similarity is not a number, set it to 0.
        if (Number.isNaN(similarity)) {
          similarity = 0
        }

        // If the event is already in the eventsSimilarity array, add the similarity to its similarity array
        if (eventsSimilarity.find((e) => e._id === event._id)) {
          const eventIndex = eventsSimilarity.findIndex(
            (e) => e._id === event._id,
          )
          eventsSimilarity[eventIndex].similarity.push(similarity)
        } else {
          eventsSimilarity.push({ ...event, similarity: [similarity] })
        }
      }
    }

    console.log(eventsSimilarity)

    return eventsSimilarity
      .map((event) => {
        // For each event, return a new object that includes all properties of the event
        // and a new property 'matchScore' which is the average of the values in the 'similarity' array
        return {
          ...event,
          matchScore:
            event.similarity.reduce((a, b) => a + b, 0) /
            event.similarity.length,
        }
      })
      .sort((a, b) => {
        return b.matchScore - a.matchScore
      })

    // var similarity: { [key: string]: number } = {};

    // for (let key in this.events) {
    //   similarity[key] = this.cosineSimilarity(this.playlist, this.events[key]);
    // }

    // console.log(similarity);
    // return similarity;
  }
}
