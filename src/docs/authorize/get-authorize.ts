export const getAuthorize = {
  get: {
    tags: ['Get Auth'],
    operationId: 'getAuth',
    summary: 'Get authorization information.',
    description: 'Retrieve information about the authorization.',
    security: [
      {
        BearerAuth: [],
      },
    ],
    responses: {
      200: {
        description: 'Authorization information.',
        content: {
          'text/plain': {
            schema: {
              type: 'string',
            },
          },
        },
      },
      500: {
        description: 'Internal server error.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example:
                    'Error occurred while fetching authorization information.',
                },
              },
            },
          },
        },
      },
    },
  },
}

export default getAuthorize
