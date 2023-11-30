import { ObjectId } from "mongodb";
import Event from "../models/event";
import CoreRepository from "./coreRepository";

export class EventRepository extends CoreRepository {
  constructor() {
    super(
      "events",
      ["ticketMasterId"],
      [
        {
          name: "artistEvents",
          foreignTable: "artists",
          primaryKey: "ticketMasterId",
          foreignKey: "ticketMasterId",
        },
      ]
    );
  }

  public async linkEventToArtist(
    event: Event,
    artistId: string | number
  ): Promise<void> {
    await this.insertIntoRelationTable(
      "artistEvents",
      artistId,
      event.ticketMasterId
    );
  }

  public async getEvents(): Promise<Event[]> {
    const data = await (await this.collection).find({}).toArray();
    return data as unknown as Event[];
  }

  public async createEvent(event: Event): Promise<Event | boolean> {
    const data = await (await this.collection).insertOne(event);
    return data.acknowledged ? event : false;
  }

  public async getEventByTicketMasterId(
    ticketMasterId: string
  ): Promise<Event | boolean> {
    const data = await (
      await this.collection
    ).findOne({ ticketMasterId: ticketMasterId });
    return data ? (data as unknown as Event) : false;
  }
}
