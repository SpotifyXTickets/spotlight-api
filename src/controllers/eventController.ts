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
}
