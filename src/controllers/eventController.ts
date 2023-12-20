import { EventRepository } from './../repositories/eventRepository'
import { Request, Response } from 'express'
import { AppController } from './appController'
import TicketMasterLogic from '../logics/ticketMasterLogic'
import { ErrorType } from '../types/errorType'
import Event from '../models/event'
import isErrorResponse from '../helpers/isErrorResponse'
import { EventLogic } from '../logics/eventLogic'

export default class EventController extends AppController {
  private ticketMasterLogic: TicketMasterLogic
  private eventLogic: EventLogic

  constructor() {
    super()
    this.ticketMasterLogic = new TicketMasterLogic()
    this.eventLogic = new EventLogic()
    this.setRoutes([
      {
        uri: '/',
        middlewares: [],
        method: this.getAllEvents.bind(this),
      },
      {
        uri: '/:id',
        middlewares: [],
        method: this.getEventById.bind(this),
      },
      {
        uri: '/favorite',
        middlewares: [],
        method: this.getFavoriteEvents.bind(this),
      },
      {
        HttpMethod: 'POST',
        uri: '/favorite/:id',
        middlewares: [],
        method: this.addFavoriteEvent.bind(this),
      },
      {
        HttpMethod: 'DELETE',
        uri: '/favorite/:id',
        middlewares: [],
        method: this.removeFavoriteEvent.bind(this),
      },
    ])
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
  public async getAllEvents(
    req: Request,
    res: Response,
  ): Promise<ErrorType | void> {
    const events = await this.eventLogic.getEvents()

    res.send(events)
  }

  public async getFavoriteEvents(): Promise<void> {
    throw new Error('Not implemented')
  }

  public async addFavoriteEvent(): Promise<void> {
    throw new Error('Not implemented')
  }

  public async removeFavoriteEvent(): Promise<void> {
    throw new Error('Not implemented')
  }

  public async getEventById(
    req: Request,
    res: Response<{
      error?: ErrorType
      event?: Event
    }>,
  ): Promise<void> {
    const id = req.params.id
    const eventRepository = new EventRepository()
    const event = await eventRepository.getEventById(id)

    if (isErrorResponse(event)) {
      res.status(404).send({
        error: {
          status: 404,
          statusText: 'Not Found',
          message: 'Event not found',
        },
      })
      return
    }
    res.send({
      event: event,
    })
  }
}
