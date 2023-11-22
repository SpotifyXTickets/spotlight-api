export type Event = {
  _id: string; // Will be the same as the ticketMasterId for the event.
  meanScore: number;
  city: string;
  state: string;
  country: string;
  address: string;
  locationLon: number;
  locationLat: number;
  description: string;
  name: string;
  imageUrl: string;
  ticketLink: string;
  startDate: Date;
  endDate: Date;
};

export default Event;
