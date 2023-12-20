import axios, { AxiosResponse } from 'axios'
import {
  TicketMasterArtistType,
  TicketMasterEventResponse,
  TicketMasterEventType,
} from '../types/ticketMasterTypes'
import { ErrorType } from '../types/errorType'
import isErrorResponse from '../helpers/isErrorResponse'

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

  public async getTMArtistsByEventId(
    tmEventId: string,
  ): Promise<TicketMasterArtistType[] | ErrorType> {
    const response = await axios
      .get(
        `https://app.ticketmaster.com/discovery/v2/events.json?apiKey=${process.env.TICKET_MASTER_API_KEY}&id=${tmEventId}`,
      )
      .then((res: AxiosResponse<TicketMasterEventResponse>) => {
        return res.data._embedded.events
      })
      .catch((error) => {
        console.log(error)
        return {
          status: 404,
          statusText: 'Not Found',
          message: 'Event was not found',
        } as ErrorType
      })

    if (isErrorResponse(response)) {
      return response
    }

    if (response === undefined) {
      return {
        status: 404,
        statusText: 'Not Found',
        message: 'Event was not found',
      } as ErrorType
    }

    return response[0]._embedded.attractions as TicketMasterArtistType[]
  }
}
