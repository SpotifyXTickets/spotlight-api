import Playlist from "../models/playlist";
import Track from "../models/track";
import { EventRepository } from "../repositories/eventRepository";
import SpotifyLogic from "./spotifyLogic";

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
    apiKey: string
  ): Promise<Event & { matchScore: number }> {
    const spotifyLogic = new SpotifyLogic();
    const eventRepository = new EventRepository();

    const events = await eventRepository.getEvents();

    const userPlaylists = await spotifyLogic.getPlaylists(apiKey);

    if (!userPlaylists) {
      throw new Error("No playlists found");
    }

    return {} as Event & { matchScore: number };

    // var similarity: { [key: string]: number } = {};

    // for (let key in this.events) {
    //   similarity[key] = this.cosineSimilarity(this.playlist, this.events[key]);
    // }

    // console.log(similarity);
    // return similarity;
  }
}
