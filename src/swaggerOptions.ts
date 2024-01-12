// Import the 'swagger-jsdoc' library for generating Swagger documentation.
import swaggerJsdoc from 'swagger-jsdoc'

const EventSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
  },
}
const ArtistSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    content: { type: 'string' },
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
    id: { type: 'string' },
    title: { type: 'string' },
    content: { type: 'string' },
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
    id: { type: 'string' },
    name: { type: 'string' },
  },
}

// Define Swagger options specifying metadata about our API.
const swaggerOptions: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: '3.0.0', // Swagger version
    info: {
      title: 'Spotify X TicketSwap API',
      version: '1.0.0',
      description: 'Swagger Documentation',
    },
    servers: [
      {
        url: 'http://localhost:8000', // Base URL for API
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
      },
    },
  },
  apis: ['./controllers/*.ts'], // Adjust the path to include all controller files
}

// Generate Swagger documentation using swagger-jsdoc
const swaggerDocs = swaggerJsdoc(swaggerOptions)

export default swaggerDocs
