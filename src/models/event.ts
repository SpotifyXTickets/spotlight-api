import { ObjectId } from "bson";

export type Event = {
  _id: ObjectId; // Will be the same as the ticketMasterId for the event.
  ticketMasterId: string;
  meanScore: number;
  city: string;
  postalCode: string;
  country: string;
  address: string;
  locationLon: number;
  locationLat: number;
  description: string;
  name: string;
  imageUrl: string;
  ticketLink: string;
  startDate: Date;
  endDate?: Date;
};

export default Event;
