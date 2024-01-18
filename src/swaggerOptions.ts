import swaggerJsdoc from 'swagger-jsdoc'

const EventSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    meanScore: { type: 'number' },
    name: { type: 'string' },
    imageUrl: { type: 'string' },
    description: { type: 'string' },
    tickets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ticketeer: { type: 'string', enum: ['ticketmaster'] },
          venue: {
            type: 'object',
            properties: {
              city: { type: 'string' },
              country: { type: 'string' },
              address: { type: 'string' },
              postalCode: { type: 'string' },
              locationLon: { type: 'number' },
              locationLat: { type: 'number' },
            },
          },
          ticketId: { type: 'string' },
          ticketLink: { type: 'string' },
          eventStartDate: { type: 'string', format: 'date-time' },
          eventEndData: { type: 'string', format: 'date-time' },
          ticketSaleStartDate: { type: 'string', format: 'date-time' },
          ticketSaleEndDate: { type: 'string', format: 'date-time' },
        },
      },
    },
    _embedded: {
      type: 'object',
      properties: {
        tracks: {
          type: 'array',
          items: { $ref: '#/components/schemas/Track' },
        },
        artists: {
          type: 'array',
          items: { $ref: '#/components/schemas/Artist' },
        },
      },
    },
  },
}

const ArtistSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    spotifyId: { type: 'string' },
    ticketMasterId: { type: 'string' },
    genres: { type: 'array', items: { type: 'string' } },
    name: { type: 'string' },
    imageUrl: { type: 'string' },
    meanScore: { type: 'number' },
    socialMedia: {
      type: 'object',
      properties: {
        website: { type: 'string' },
        facebook: { type: 'string' },
        twitter: { type: 'string' },
        instagram: { type: 'string' },
        youtube: { type: 'string' },
        spotify: { type: 'string' },
        lastfm: { type: 'string' },
      },
    },
  },
}

const AuthorizeSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    content: { type: 'string' },
  },
}

const RecommendSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    content: { type: 'string' },
  },
}

const Recommend2Schema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    content: { type: 'string' },
  },
}

const PlaylistSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    name: { type: 'string' },
    imageUrl: { type: 'string' },
    totalTracks: { type: 'number' },
    meanScore: { type: 'number' },
    _embedded: {
      type: 'object',
      properties: {
        tracks: {
          type: 'array',
          items: { $ref: '#/components/schemas/Track' },
        },
        artists: {
          type: 'array',
          items: { $ref: '#/components/schemas/Artist' },
        },
      },
    },
  },
}

const SettingSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    content: { type: 'string' },
  },
}

const UserSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    country: { type: 'string' },
    display_name: { type: 'string' },
    email: { type: 'string' },
    images: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          height: { type: 'number' },
          url: { type: 'string' },
          width: { type: 'number' },
        },
      },
    },
    _embedded: {
      type: 'object',
      properties: {},
    },
  },
}

const TrackSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string' }, // Assuming ObjectId is represented as a string
    spotifyId: { type: 'string' },
    name: { type: 'string' },
    audioData: {
      type: 'object',
      properties: {
        accousticness: { type: 'number' },
        danceability: { type: 'number' },
        energy: { type: 'number' },
        instrumentalness: { type: 'number' },
        liveness: { type: 'number' },
        loudness: { type: 'number' },
        speechiness: { type: 'number' },
        tempo: { type: 'number' },
        valence: { type: 'number' },
      },
    },
    _embedded: {
      type: 'object',
      properties: {
        artists: {
          type: 'array',
          items: { $ref: '#/components/schemas/Artist' },
        },
      },
    },
  },
}

const swaggerOptions: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Spotify X TicketSwap API',
      version: '1.0.0',
      description: 'Swagger Documentation',
    },
    servers: [
      {
        url: 'http://localhost:8000',
      },
    ],
    components: {
      schemas: {
        Event: EventSchema,
        Artist: ArtistSchema,
        Auth: AuthorizeSchema,
        Recommend: RecommendSchema,
        Recommend2: Recommend2Schema,
        Playlist: PlaylistSchema,
        Setting: SettingSchema,
        User: UserSchema,
        Track: TrackSchema,
      },
    },
  },
  apis: ['./controllers/*.ts'],
}

const swaggerDocs = swaggerJsdoc(swaggerOptions)

export default swaggerDocs
