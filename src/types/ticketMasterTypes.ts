/* eslint-disable @typescript-eslint/no-explicit-any */
export type TicketMasterEventType = {
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
      dateTime: string
      noSpecificTime: boolean
      timeTBA: boolean
    }
    end: {
      localDate: string
      dateTime: string
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
  description: string
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
  _embedded: {
    venues: Array<TicketMasterVenueType>
    attractions: Array<TicketMasterArtistType>
  }
}

export type TicketMasterVenueType = {
  distance: number
  units: string
  id: string
  locale: string
  name: string
  description: string
  address: {
    line1: string
    line2: string
    line3: string
  }
  city: {
    name: string
  }
  country: {
    countryCode: string
    name: string
  }
  url: string
  postalCode: string
  location: {
    longitude: number
    latitude: number
  }
}

export type TicketMasterArtistType = {
  id: string
  name: string
  locale: string
  desription: string
  additionalInfo: string
  url: string
  images: Array<{
    url: string
    ratio: '16_9' | '3_2' | '4_3'
    width: number
    height: number
    fallback: boolean
    attribution: string
  }>
  externalLinks: {
    youtube?: Array<{
      url: string
    }>
    twitter?: Array<{
      url: string
    }>
    facebook?: Array<{
      url: string
    }>
    instagram?: Array<{
      url: string
    }>
    spotify?: Array<{
      url: string
    }>
    itunes?: Array<{
      url: string
    }>
    lastfm?: Array<{
      url: string
    }>
    wiki?: Array<{
      url: string
    }>
    homepage?: Array<{
      url: string
    }>
    musicBrainz?: Array<{
      url: string
    }>
    upcomingEvents: {
      _total: number
      _filtered: number
      universe: number
      mfxNl: number
      tmr: number
      ticketmaster: number
    }
  }
}

export type TicketMasterEventResponse = {
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

export type TicketMasterClassificationResponse = {
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
