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
    // Data order should be [Danceability, Energy, Loudness, Speechiness, Acousticness, Instrumentalness, Liveness, Valence, Tempo]
    // All data should be scaled down to a value between 0 and 1
    var playlist = [
      0.633, 0.162, 0.104, 0.475, 0.923, 0.933, 0.252, 0.195, 0.726,
    ];
    var events: { [key: string]: number[] } = {
      event1: [0.123, 0.456, 0.789, 0.321, 0.654, 0.987, 0.135, 0.468, 0.791],
      event2: [0.246, 0.579, 0.802, 0.135, 0.468, 0.791, 0.024, 0.357, 0.68],
      event3: [0.369, 0.702, 0.925, 0.258, 0.591, 0.814, 0.147, 0.48, 0.703],
      event4: [0.492, 0.825, 0.158, 0.381, 0.714, 0.937, 0.27, 0.603, 0.826],
      event5: [0.615, 0.948, 0.271, 0.604, 0.937, 0.16, 0.493, 0.826, 0.159],
    };
    var eventsV2: { [key: string]: any } = {
      event1: {
        name: "event1",
        eventMetaData: [
          0.123, 0.456, 0.789, 0.321, 0.654, 0.987, 0.135, 0.468, 0.791,
        ],
        date: "2021-01-01",
        location: "Location event1",
        ticketStartingPrice: 10,
        eventDescription: "Description event1",
        spotifyArtistID: "1u7uShzlA1tXJeox3jMFPq", // De jeugd van tegenwoordig
        eventImage: "lorempicsum.com/200/200",
      },
      event2: {
        name: "event2",
        eventMetaData: [
          0.246, 0.579, 0.802, 0.135, 0.468, 0.791, 0.024, 0.357, 0.68,
        ],
        date: "2021-01-01",
        location: "Location event2",
        ticketStartingPrice: 10,
        eventDescription: "Description event2",
        spotifyArtistID: "6s5ubAp65wXoTZefE01RNR", // Joost
        eventImage: "lorempicsum.com/200/200",
      },
      event3: {
        name: "event3",
        eventMetaData: [
          0.369, 0.702, 0.925, 0.258, 0.591, 0.814, 0.147, 0.48, 0.703,
        ],
        date: "2021-01-01",
        location: "Location event3",
        ticketStartingPrice: 10,
        eventDescription: "Description event3",
        spotifyArtistID: "23951Pg9PiLB8Uza3k12g6", // The opposites
        eventImage: "lorempicsum.com/200/200",
      },
    };

    const recommendationsLogic = new RecommendationsLogic(playlist, eventsV2);

    res.send(JSON.stringify(await recommendationsLogic.recommendEvent()));
  }
}

module.exports = RecommendationController;
