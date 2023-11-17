export default class RecommendationsLogic {
  private playlist: number[];
  private events: { [key: string]: number[] };

  constructor(playlist: number[], events: { [key: string]: number[] }) {
    this.playlist = playlist;
    this.events = events;
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

  public recommendEvent(): { [key: string]: number } {
    console.log("Recommendation page logging");
    var similarity: { [key: string]: number } = {};

    for (let key in this.events) {
      similarity[key] = this.cosineSimilarity(this.playlist, this.events[key]);
    }

    console.log(similarity);
    return similarity;
  }
}
