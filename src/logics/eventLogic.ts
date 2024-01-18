import { EmbeddedEvent } from '../models/event'
import { EventRepository } from '../repositories/eventRepository'
import { ErrorType } from '../types/errorType'

export class EventLogic {
  private eventRepository: EventRepository
  constructor() {
    this.eventRepository = new EventRepository()
  }

  public async getEvents(): Promise<EmbeddedEvent[]> {
    return await this.eventRepository.getEvents()
  }

  public async getEventById(
    eventId: string,
  ): Promise<EmbeddedEvent | ErrorType> {
    return await this.eventRepository.getEventById(eventId)
  }
}
