import { EventRepository } from './../repositories/eventRepository'
import { Request, Response } from 'express'
import { AppController } from './appController'
import TicketMasterLogic from '../logics/ticketMasterLogic'

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: API operations for managing events
 */

export default class EventController extends AppController {
  private ticketMasterLogic: TicketMasterLogic

  constructor() {
    super()
    this.ticketMasterLogic = new TicketMasterLogic()
    this.setRoutes([
      {
        uri: '/events',
        middlewares: [],
        method: this.getAllEvents,
      },
      {
        uri: '/events/:id',
        middlewares: [],
        method: this.getEventById,
      },
      {
        uri: '/classifications',
        middlewares: [],
        method: this.getClassifications,
      },
    ])
  }

  /**
   * @swagger
   * /events:
   *   get:
   *     summary: Get all events.
   *     description: Retrieve a list of all events.
   *     tags: [Events]
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
    const ticketMasterLogic = new TicketMasterLogic()
    const events = await ticketMasterLogic.getAllEvents()

    console.log(events)
    if (events === undefined) {
      res.status(500).send('Error')
      return
    }
    res.send(events)
  }

  /**
   * @swagger
   * /classifications:
   *   get:
   *     summary: Get event classifications.
   *     description: Retrieve a list of event classifications.
   *     tags: [Events]
   *     responses:
   *       200:
   *         description: A list of event classifications.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Classification'  // Reference to Classification schema
   *       500:
   *         description: Internal server error.
   */
  public async getClassifications(req: Request, res: Response): Promise<void> {
    const ticketMasterLogic = new TicketMasterLogic()
    const classifications = await ticketMasterLogic.getClassifications()

    if (classifications === undefined) {
      res.status(500).send('Error')
      return
    }
    res.send(classifications)
  }

  /**
   * @swagger
   * /events/{id}:
   *   get:
   *     summary: Get an event by ID.
   *     description: Retrieve an event based on its unique identifier.
   *     tags: [Events]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: The ID of the event to retrieve.
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: The requested event.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Event'
   *       404:
   *         description: Event not found.
   *       500:
   *         description: Internal server error.
   */
  public async getEventById(req: Request, res: Response): Promise<void> {
    const id = req.params.id
    const eventRepository = new EventRepository()
    const event = await eventRepository.getEventByTicketMasterId(id)

    if (event === false) {
      res.status(404).send('Not found')
      return
    }
    res.send(event)
  }
}
