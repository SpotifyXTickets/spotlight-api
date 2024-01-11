import { EmbeddedEvent } from '../models/event'
import { EventRepository } from '../repositories/eventRepository'

export class EventLogic {
  private eventRepository: EventRepository
  constructor() {
    this.eventRepository = new EventRepository()
  }

  public async getEvents(): Promise<EmbeddedEvent[]> {
    return await this.eventRepository.getEvents()
  }
}
