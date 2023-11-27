import Event from "../models/event";
import CoreRepository from "./coreRepository";

export class EventRepository extends CoreRepository {
  constructor() {
    super("events", [
      {
        name: "artistEvents",
        foreignTable: "artists",
        primaryKey: "_id",
        foreignKey: "ticketMasterId",
      },
    ]);
  }

  public async getEvents(): Promise<Event[]> {
    const data = await (await this.collection).find({}).toArray();
    return data as unknown as Event[];
  }

  public async createEvent(event: Event): Promise<Event | boolean> {
    const data = await (await this.collection).insertOne(event);
    return data.acknowledged ? event : false;
  }
}
