export default class RecommendationsLogic {
  private playlist: number[];
  private events: { [key: string]: any };

  private similarity: {
    [key: string]: {
      name: string;
      recommendationScore: any;
      date: string;
      location: string;
      ticketStartingPrice: number;
      eventDescription: string;
      spotifyArtistID: string;
    };
  };

  constructor(playlist: number[], events: { [key: string]: any }) {
    this.playlist = playlist;
    this.events = events;
    this.similarity = {};
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

  public recommendEvent() {
    for (let key in this.events) {
      // similarity[key] = this.cosineSimilarity(this.playlist, this.events[key]);
      // console.log(key + " " + similarity[key]);
      this.similarity[key] = {
        name: this.events[key].name,
        recommendationScore: this.cosineSimilarity(
          this.playlist,
          this.events[key].eventMetaData
        ),
        date: this.events[key].date,
        location: this.events[key].location,
        ticketStartingPrice: this.events[key].ticketStartingPrice,
        eventDescription: this.events[key].eventDescription,
        spotifyArtistID: this.events[key].spotifyArtistID,
      };
    }
    return this.similarity;
  }
}
