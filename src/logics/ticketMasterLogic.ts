import axios, { AxiosResponse } from 'axios'
import { Genres } from '../enums/genres'

type TicketMasterEventType = {
  classifications: Array<{
    family: boolean
    genre: {
      id: string
      name: string
    }
    primary: boolean
    segment: {
      id: string
      name: string
    }
    subGenre: {
      id: string
      name: string
    }
  }>
  dates: {
    spanMultipleDays: boolean
    start: {
      dateTBA: boolean
      dateTBD: boolean
      localDate: string
      noSpecificTime: boolean
      timeTBA: boolean
    }
    status: {
      code: string
    }
    timezone: string
  }
  id: string
  images: Array<{
    fallback: boolean
    height: number
    width: number
    ratio: string
    url: string
  }>
  locale: string
  name: string
  priceRange: {
    type: string
    currency: string
    max: number
    min: number
  }
  promoter: {
    id: string
    name: string
  }
  promoters: Array<{
    id: string
    name: string
  }>
  sales: {
    public: {
      startDateTime: string
      endDateTime: string
      startTBA: boolean
      startTBD: boolean
    }
  }
  seatmap: {
    staticUrl: string
  }
  test: boolean
  type: string
  url: string
}

type TicketMasterEventResponse = {
  _embedded: {
    events?: TicketMasterEventType[]
  }
  _links: {
    self: {
      href: string
    }
    first: {
      href: string
    }
    last: {
      href: string
    }
    next: {
      href: string
    }
  }
}

type TicketMasterClassificationResponse = {
  _embedded: {
    classifications: any[]
  }
  _links: {
    self: {
      href: string
    }
    first: {
      href: string
    }
    last: {
      href: string
    }
    next: {
      href: string
    }
  }
}

export default class TicketMasterLogic {
  public async getAllEvents(): Promise<{
    events: TicketMasterEventType[]
    links: TicketMasterEventResponse['_links']
  } | void> {
    const response = await axios
      .get(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKET_MASTER_API_KEY}&locale=*&countryCode=NL&size=200&sort=date,asc&classificationName=[music]`,
      )
      .then((res: AxiosResponse<TicketMasterEventResponse>) => {
        const events = res.data._embedded.events ?? []
        return {
          events: res.data._embedded.events ?? [],
          links: res.data._links,
        }
      })
      .catch((error) => {
        console.log(error)
      })

    return response
  }

  public async getClassifications(): Promise<{
    events: TicketMasterEventType[]
    links: TicketMasterEventResponse['_links']
  } | void> {
    const response = await axios
      .get(
        `https://app.ticketmaster.com/discovery/v2/classifications.json?apikey=${process.env.TICKET_MASTER_API_KEY}`,
      )
      .then((res: AxiosResponse<TicketMasterClassificationResponse>) => {
        const classifications = res.data._embedded.classifications
        return {
          events: res.data._embedded.classifications,
          links: res.data._links,
        }
      })
      .catch((error) => {
        console.log(error)
      })

    return response
  }

  public async getEventsByGenre(
    genre: string,
    size: number,
    keyword?: string,
    startDateTime?: string,
    endDateTime?: string,
  ): Promise<{
    events: TicketMasterEventType[]
    links: TicketMasterEventResponse['_links']
  } | void> {
    const genreCap: string = genre.charAt(0).toUpperCase() + genre.slice(1)
    const genres: Record<string, string> = Genres

    let genreId = genres[genreCap]

    const response = await axios
      .get(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKET_MASTER_API_KEY}&size=${size}&locale=*&countryCode=NL&sort=relevance,desc&classificationId=${genreId},${Genres.Music}`,
      )
      .then((res: AxiosResponse<TicketMasterEventResponse>) => {
        return {
          events: res.data._embedded ? res.data._embedded.events ?? [] : [],
          links: res.data._links,
        }
      })
      .catch((error) => {
        console.log(error)
      })

    return response
  }
}
