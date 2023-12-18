import Event, { EmbeddedEvent } from '../models/event'
import CoreRepository from './coreRepository'

export class EventRepository extends CoreRepository {
  constructor() {
    super('events')
  }

  public async linkEventToArtist(
    event: Event,
    artistId: string | number,
  ): Promise<void> {
    await this.insertIntoRelationTable(
      'artistEvents',
      artistId,
      event.ticketMasterId,
    )
  }

  public async getEvents(): Promise<EmbeddedEvent[]> {
    const data = await (await this.collection).find({}).toArray()
    return data as unknown as EmbeddedEvent[]
  }

  public async createEvent(event: Event): Promise<Event | boolean> {
    const data = await (await this.collection).insertOne(event)
    return data.acknowledged ? event : false
  }

  public async getEventByTicketMasterId(
    ticketMasterId: string,
  ): Promise<Event | boolean> {
    const data = await (
      await this.collection
    ).findOne({ ticketMasterId: ticketMasterId })
    return data ? (data as unknown as Event) : false
  }

  public async updateEvent(event: Event): Promise<boolean | Event> {
    const data = await (
      await this.collection
    ).updateOne({ _id: event._id }, { $set: event })
    return data.acknowledged ? event : false
  }
}
