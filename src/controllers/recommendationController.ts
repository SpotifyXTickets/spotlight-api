import { Request, Response } from "express";
import { AppController } from "./appController";

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

  public recommendEvent(req: Request, res: Response): void {
    res.send("Recommendation page");
  }
}

module.exports = RecommendationController;
