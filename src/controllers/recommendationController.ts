import { Request, Response } from "express";
import { AppController } from "./appController";
import RecommendationsLogic from "../logics/recommendationsLogic";
import { Authenticated } from "../middlewares/authenticationMiddleware";

export default class RecommendationController extends AppController {
  constructor() {
    super();

    this.setRoutes([
      {
        uri: "/",
        middlewares: [Authenticated],
        method: this.recommendEvent,
      },
    ]);
  }

  public async recommendEvent(req: Request, res: Response): Promise<void> {
    if (req.headers.authorization === undefined) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const playlistIds = req.query.playlistIds
      ? ((req.query.playlistIds as string).split(",") as string[])
      : [];
    // Test data
    // Data order should be [Danceability, Energy, Loudness, Speechiness, Acousticness, Instrumentalness, Liveness, Valence, Tempo]
    // All data should be scaled down to a value between 0 and 1

    const apiKey = req.headers.authorization!.split(" ")[1];
    const recommendationsLogic = new RecommendationsLogic();
    const events = (
      await recommendationsLogic.recommendEvent(apiKey, playlistIds)
    ).slice(0, 6);

    res.send();
    // var playlist = [
    //   0.633, 0.162, 0.104, 0.475, 0.923, 0.933, 0.252, 0.195, 0.726,
    // ];
    // var events: { [key: string]: number[] } = {
    //   event1: [0.123, 0.456, 0.789, 0.321, 0.654, 0.987, 0.135, 0.468, 0.791],
    //   event2: [0.246, 0.579, 0.802, 0.135, 0.468, 0.791, 0.024, 0.357, 0.68],
    //   event3: [0.369, 0.702, 0.925, 0.258, 0.591, 0.814, 0.147, 0.48, 0.703],
    //   event4: [0.492, 0.825, 0.158, 0.381, 0.714, 0.937, 0.27, 0.603, 0.826],
    //   event5: [0.615, 0.948, 0.271, 0.604, 0.937, 0.16, 0.493, 0.826, 0.159],
    // };

    // const recommendationsLogic = new RecommendationsLogic(playlist, events);

    // res.send(
    //   "Recommendation page " +
    //     JSON.stringify(await recommendationsLogic.recommendEvent())
    // );
  }
}

module.exports = RecommendationController;
