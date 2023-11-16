import { Request, Response } from "express";
import { AppController } from "./appController";
import TicketMasterLogic from "../logics/ticketMasterLogic";

export default class EventController extends AppController {
  private ticketMasterLogic: TicketMasterLogic;

  constructor() {
    super();
    this.ticketMasterLogic = new TicketMasterLogic();
    this.setRoutes([
      {
        uri: "/events",
        middlewares: [],
        method: this.getAllEvents,
      },
    ]);
  }

  /**
   * @swagger
   * /events:
   *   get:
   *     summary: Get all events.
   *     description: Retrieve a list of all events.
   *     responses:
   *       200:
   *         description: A list of events.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Event'  // Reference to Event schema (define this in Swagger options)
   */
  public async getAllEvents(req: Request, res: Response): Promise<void> {
    const events = await this.ticketMasterLogic.getAllEvents();

    if (events === undefined) {
      res.status(500).send("Error");
      return;
    }
    res.send(events);
  }
}
