import axios, { AxiosResponse } from "axios";

type TicketMasterEventType = {
  classifications: Array<{
    family: boolean;
    genre: {
      id: string;
      name: string;
    };
    primary: boolean;
    segment: {
      id: string;
      name: string;
    };
    subGenre: {
      id: string;
      name: string;
    };
  }>;
  dates: {
    spanMultipleDays: boolean;
    start: {
      dateTBA: boolean;
      dateTBD: boolean;
      localDate: string;
      noSpecificTime: boolean;
      timeTBA: boolean;
    };
    status: {
      code: string;
    };
    timezone: string;
  };
  id: string;
  images: Array<{
    fallback: boolean;
    height: number;
    width: number;
    ratio: string;
    url: string;
  }>;
  locale: string;
  name: string;
  priceRange: {
    type: string;
    currency: string;
    max: number;
    min: number;
  };
  promoter: {
    id: string;
    name: string;
  };
  promoters: Array<{
    id: string;
    name: string;
  }>;
  sales: {
    public: {
      startDateTime: string;
      endDateTime: string;
      startTBA: boolean;
      startTBD: boolean;
    };
  };
  seatmap: {
    staticUrl: string;
  };
  test: boolean;
  type: string;
  url: string;
};

type TicketMasterEventResponse = {
  _embedded: {
    events: TicketMasterEventType[];
  };
  _links: {
    self: {
      href: string;
    };
    first: {
      href: string;
    };
    last: {
      href: string;
    };
    next: {
      href: string;
    };
  };
};

export default class TicketMasterLogic {
  public async getAllEvents(): Promise<{
    events: TicketMasterEventType[];
    links: TicketMasterEventResponse["_links"];
  } | void> {
    const response = await axios
      .get(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKET_MASTER_API_KEY}&locale=*&countryCode=NL&size=200&sort=date,asc&classificationName=[music]`
      )
      .then((res: AxiosResponse<TicketMasterEventResponse>) => {
        const events = res.data._embedded.events;
        return { events: res.data._embedded.events, links: res.data._links };
      })
      .catch((error) => {
        console.log(error);
      });

    return response;
  }
}
