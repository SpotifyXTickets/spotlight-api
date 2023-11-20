export const getEvents = {
  // operation's method
  get: {
    tags: ['Get Events'], // operation's tag.
    operationId: 'getEvents', // unique operation id
    responses: {
      // response code
      200: {
        description: 'List of events obtained.', // response desc.
        content: {
          // content-type
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Event', // Reference to Event schema (define this in Swagger options)
              },
            },
          },
        },
      },
      // response code
      500: {
        description: 'Internal server error.', // response desc.
        content: {
          // content-type
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Error occurred while fetching events.',
                },
              },
            },
          },
        },
      },
    },
  },
}

export default getEvents
