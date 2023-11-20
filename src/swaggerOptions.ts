// Import the 'swagger-jsdoc' library for generating Swagger documentation.
import swaggerJsdoc from 'swagger-jsdoc'

// Define the schema for the Event object
const EventSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    // ... (other properties of the Event object)
  },
}

// Define the schema for the Home object
const HomeSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    content: { type: 'string' },
    // ... (other properties of the Home object)
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
        url: 'http://localhost:3000', // Base URL for API
      },
    ],
    components: {
      schemas: {
        Event: EventSchema, // Include the Event schema
        Home: HomeSchema, // Include the Home schema
      },
    },
  },
  apis: ['./controllers/*.ts'], // Adjust the path to include all controller files
}

// Generate Swagger documentation using swagger-jsdoc
const swaggerDocs = swaggerJsdoc(swaggerOptions)

export default swaggerDocs
