import { ObjectId } from 'bson'
import isErrorResponse from '../helpers/isErrorResponse'
import Event, { EmbeddedEvent } from '../models/event'
import { ErrorType } from '../types/errorType'
import CoreRepository from '../coreRepository'
import 'reflect-metadata'
import { Service } from 'typedi'

@Service()
export class EventRepository extends CoreRepository {
  constructor() {
    super('events')
  }

  public async getEvents(): Promise<EmbeddedEvent[]> {
    const data = await (await this.collection).find({}).toArray()
    return data as unknown as Event[]
  }

  public async createManyEvents(
    events: EmbeddedEvent[],
  ): Promise<EmbeddedEvent[] | ErrorType> {
    const data = await (await this.collection).insertMany(events)
    return data.acknowledged
      ? events
      : {
          status: 400,
          statusText: 'Bad Request',
          message: 'Event not created',
        }
  }

  public async createEvent(
    event: EmbeddedEvent,
  ): Promise<EmbeddedEvent | ErrorType> {
    const data = await (await this.collection).insertOne(event)
    return data.acknowledged
      ? ({ ...event, _id: data.insertedId } as EmbeddedEvent)
      : {
          status: 400,
          statusText: 'Bad Request',
          message: 'Event not created',
        }
  }

  public async updateEvent(
    event: EmbeddedEvent,
  ): Promise<EmbeddedEvent | ErrorType> {
    const data = await (
      await this.collection
    ).updateOne({ _id: event._id }, { $set: event })
    return data.acknowledged
      ? event
      : {
          status: 400,
          statusText: 'Bad Request',
          message: 'Event not updated',
        }
  }

  public async getEventByTicketMasterId(
    ticketMasterId: string,
  ): Promise<EmbeddedEvent | ErrorType> {
    const data = await (
      await this.collection
    ).findOne({
      tickets: {
        $elemMatch: {
          ticketId: ticketMasterId,
        },
      },
    })

    const typedData =
      data !== null
        ? (data as EmbeddedEvent)
        : ({
            status: 404,
            statusText: 'Not Found',
            message: 'Event not found',
          } as ErrorType)

    if (isErrorResponse(typedData)) {
      return typedData
    }

    return typedData
  }

  public async getEventById(
    eventId: string,
  ): Promise<EmbeddedEvent | ErrorType> {
    const data = await (
      await this.collection
    ).findOne({
      _id: new ObjectId(eventId),
    })

    const typedData =
      data !== null
        ? (data as EmbeddedEvent)
        : ({
            status: 404,
            statusText: 'Not Found',
            message: 'Event not found',
          } as ErrorType)

    if (isErrorResponse(typedData)) {
      return typedData
    }

    return typedData
  }

  // public async updateEvent(event: Event): Promise<boolean | Event> {
  //   const data = await (
  //     await this.collection
  //   ).updateOne({ _id: event._id }, { $set: event })
  //   return data.acknowledged ? event : false
  // }
}
