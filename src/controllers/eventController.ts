import TicketMasterLogic from "../logics/ticketMasterLogic";
import { AppController } from "./appController";
import { Request, Response } from "express";

export default class EventController extends AppController {
  private ticketMasterLogic: TicketMasterLogic;
  constructor() {
    super();
    this.ticketMasterLogic = new TicketMasterLogic();
    this.setRoutes([
      {
        uri: "/",
        middlewares: [],
        method: this.getAllEvents,
      },
      {
        uri: "/:musicGenre",
        middlewares: [],
        method: this.getEventByMusicGenre,
      },
    ]);
  }

  public async getAllEvents(req: Request, res: Response): Promise<void> {
    const ticketMasterLogic = new TicketMasterLogic();
    const events = await ticketMasterLogic.getAllEvents();

    if (events === undefined) {
      res.status(500).send("Error");
      return;
    }
    res.send(events);
  }

  public async getClassifications(req: Request, res: Response): Promise<void> {
    const ticketMasterLogic = new TicketMasterLogic();
    const classifications = await ticketMasterLogic.getClassifications();

    if (classifications === undefined) {
      res.status(500).send("Error");
      return;
    }
    res.send(classifications);
  }

  public async getEventByMusicGenre(
    req: Request,
    res: Response
  ): Promise<void> {
    const genre = req.params.musicGenre;
    const size = req.query.size ?? 20;
    const ticketMasterLogic = new TicketMasterLogic();
    const events = await ticketMasterLogic.getEventsByGenre(
      genre,
      size as unknown as number
    );

    if (events === undefined) {
      res.status(500).send("Error");
      return;
    }
    res.send(events);
  }
}
