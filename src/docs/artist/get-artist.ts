export const getArtist = {
  // operation's method
  get: {
    tags: ['Artist'], // operation's tag.
    operationId: 'getArtist', // unique operation id
    responses: {
      // response code
      200: {
        description: 'List of artists obtained.', // response desc.
        content: {
          // content-type
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Artist', // Reference to Artist schema (define this in Swagger options)
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
                  example: 'Error occurred while fetching artists.',
                },
              },
            },
          },
        },
      },
    },
  },
}

export default getArtist
