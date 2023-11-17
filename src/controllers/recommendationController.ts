import { Request, Response } from "express";
import { AppController } from "./appController";
import RecommendationsLogic from "../logics/recommendationsLogic";

export default class RecommendationController extends AppController {
  constructor() {
    super();

    this.setRoutes([
      {
        uri: "/",
        method: this.recommendEvent,
      },
    ]);
  }

  public async recommendEvent(req: Request, res: Response): Promise<void> {
    // Test data
    var playlist = [7, 8, 9, 1000, 20000];
    var events: { [key: string]: number[] } = {
      event1: [5, 4, 3, 2, 1],
      event2: [1, 2, 3, 4, 5],
      event3: [3, 4, 5, 4, 3],
      event4: [1, 2, 3, 4, 5],
      event5: [1, 2, 3, 4, 5],
    };

    const recommendationsLogic = new RecommendationsLogic(playlist, events);

    res.send(
      "Recommendation page " +
        JSON.stringify(await recommendationsLogic.recommendEvent())
    );
  }
}

module.exports = RecommendationController;
