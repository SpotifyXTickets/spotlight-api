import axios, { AxiosResponse } from 'axios'
import { Genres } from '../enums/genres'
import {
  TicketMasterClassificationResponse,
  TicketMasterEventResponse,
  TicketMasterEventType,
} from '../types/ticketMasterTypes'

export default class TicketMasterLogic {
  public async getAllEvents(
    size?: number,
    page?: number,
  ): Promise<{
    events: TicketMasterEventType[]
    links: TicketMasterEventResponse['_links']
  } | void> {
    size = size ?? 200
    page = page ?? 0
    const response = await axios
      .get(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKET_MASTER_API_KEY}&locale=*&countryCode=NL&size=${size}&page=${page}&sort=date,asc&classificationName=[music]`,
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
