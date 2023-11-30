import Playlist from "../models/playlist";
import Track from "../models/track";
import { EventRepository } from "../repositories/eventRepository";
import { TrackRepository } from "../repositories/trackRepository";
import {
  SpotifyAudioFeaturesType,
  SpotifyPlaylistType,
  SpotifyTopTrackType,
} from "../types/spotifyTypes";
import SpotifyLogic from "./spotifyLogic";
import Event from "../models/event";
import NodeCache from "node-cache";

export default class RecommendationsLogic {
  private playlist: number[];
  private events: { [key: string]: number[] };

  constructor(playlist?: number[], events?: { [key: string]: number[] }) {
    this.playlist = playlist ?? [];
    this.events = events ? events : {};
  }

  public generateMeanScore(tracks: Track[]): number {
    const scores = tracks.map((track) => {
      const A: number[] = this.convertTrackToValidNumbers(track);
      let sumAiAi = 0;
      for (let i = 0; i < A.length; i++) {
        sumAiAi += A[i] * A[i];
      }
      return sumAiAi;
    });
    let sumTotal = 0;

    for (let i = 0; i < scores.length; i++) {
      sumTotal += scores[i];
    }

    if (Number.isNaN((sumTotal / scores.length) as number)) {
      {
        return 0;
      }
    }
    return sumTotal / scores.length;
  }

  private convertTrackToValidNumbers(track: Track): number[] {
    if ((track.tempo as number) > 300) {
      console.log("Too low tempo " + track.tempo);
    }
    return [
      track.danceability ? track.danceability : 0,
      track.energy ? track.energy : 0,
      track.loudness ? 1 - (track.loudness + 60) / 60 : 0,
      track.speechiness ? track.speechiness : 0,
      track.accousticness ? track.accousticness : 0,
      track.instrumentalness ? track.instrumentalness : 0,
      track.liveness ? track.liveness : 0,
      track.valence ? track.valence : 0,
      track.tempo ? track.tempo / 300 : 0,
    ];
  }

  // Define the function to calculate cosine similarity
  public cosineSimilarity(A: number[], B: number[]): number {
    // Initialize the sums
    let sumAiBi = 0,
      sumAiAi = 0,
      sumBiBi = 0;

    // Iterate over the elements of vectors A and B
    for (let i = 0; i < A.length; i++) {
      // Calculate the sum of Ai*Bi
      sumAiBi += A[i] * B[i];
      // Calculate the sum of Ai*Ai
      sumAiAi += A[i] * A[i];
      // Calculate the sum of Bi*Bi
      sumBiBi += B[i] * B[i];
    }

    // Calculate and return the cosine similarity
    return sumAiBi / Math.sqrt(sumAiAi * sumBiBi);
  }

  public async recommendEvent(
    apiKey: string,
    playlistIds: string[]
  ): Promise<Array<Event & { matchScore: number }>> {
    const spotifyLogic = new SpotifyLogic();
    const eventRepository = new EventRepository();
    const eventsSimilarity: Array<Event & { similarity: number[] }> = [];

    const events = await eventRepository.getEvents();

    let userPlaylists = await spotifyLogic.getPlaylists(apiKey);

    if (!userPlaylists) {
      throw new Error("No playlists found");
    }

    userPlaylists = userPlaylists as SpotifyPlaylistType[];
    const playlistWithTracks: Array<
      SpotifyPlaylistType & { tracksWithAudioData: Track[] }
    > = [];

    // const scorePlaylists;
    for (let playlistKey in userPlaylists.filter(
      (p) => playlistIds.includes(p.id) || playlistIds.length === 0
    ) as SpotifyPlaylistType[]) {
      let playlist = (
        userPlaylists.filter(
          (p) => playlistIds.includes(p.id) || playlistIds.length === 0
        ) as SpotifyPlaylistType[]
      )[playlistKey];
      const tracks = (await spotifyLogic.getPlaylistTracks(
        apiKey,
        playlist.id
      )) as SpotifyTopTrackType[];
      const tracksWithAudioFeatures: Track[] = [];
      const clonedTracks = Object.assign([], tracks) as SpotifyTopTrackType[];
      // while (clonedTracks.length > 0) {
      const tracksChunk = clonedTracks.splice(0, 100);
      const audioFeatures = await spotifyLogic.getTracksAudioFeatures(
        apiKey,
        tracksChunk.map((track) => track.id)
      );

      if (audioFeatures.length === 0) {
        continue;
      }

      tracksWithAudioFeatures.push(
        ...tracksChunk.map((track, index) => {
          return new Track(
            track,
            audioFeatures
              .filter((a) => a !== null)
              .find((audioFeature) => {
                return audioFeature.id === track.id;
              }) as SpotifyAudioFeaturesType
          );
        })
      );
      // }

      playlistWithTracks.push({
        ...playlist,
        tracksWithAudioData: tracksWithAudioFeatures,
      });

      for (let eventKey in events) {
        const event = events[eventKey];
        if (event._embedded === undefined) {
          continue;
        }

        const eventTracks = event._embedded.tracks;
        let eventTracksSum = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        let playlistTracksSum = [0, 0, 0, 0, 0, 0, 0, 0, 0];

        for (let i = 0; i < eventTracks.length; i++) {
          let featureNumbers = this.convertTrackToValidNumbers(eventTracks[i]);
          for (let j = 0; j < featureNumbers.length; j++) {
            eventTracksSum[j] += featureNumbers[j];
          }
        }

        for (let i = 0; i < tracksWithAudioFeatures.length; i++) {
          let featureNumbers = this.convertTrackToValidNumbers(
            tracksWithAudioFeatures[i]
          );
          for (let j = 0; j < featureNumbers.length; j++) {
            playlistTracksSum[j] += featureNumbers[j];
          }
        }

        eventTracksSum = eventTracksSum.map((value) => {
          return value / eventTracks.length;
        });

        playlistTracksSum = playlistTracksSum.map((value) => {
          return value / tracksWithAudioFeatures.length;
        });

        let similarity = this.cosineSimilarity(
          eventTracksSum,
          playlistTracksSum
        );

        if (Number.isNaN(similarity)) {
          similarity = 0;
        }

        if (eventsSimilarity.find((e) => e._id === event._id)) {
          const eventIndex = eventsSimilarity.findIndex(
            (e) => e._id === event._id
          );
          eventsSimilarity[eventIndex].similarity.push(similarity);
        } else {
          eventsSimilarity.push({ ...event, similarity: [similarity] });
        }
      }
    }

    console.log(eventsSimilarity);

    return eventsSimilarity
      .map((event) => {
        return {
          ...event,
          matchScore:
            event.similarity.reduce((a, b) => a + b, 0) /
            event.similarity.length,
        };
      })
      .sort((a, b) => {
        return b.matchScore - a.matchScore;
      });

    // var similarity: { [key: string]: number } = {};

    // for (let key in this.events) {
    //   similarity[key] = this.cosineSimilarity(this.playlist, this.events[key]);
    // }

    // console.log(similarity);
    // return similarity;
  }
}
