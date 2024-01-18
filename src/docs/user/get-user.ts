export const getUser = {
  get: {
    summary: 'Get users information.',
    description: 'Retrieve detailed information for all users.',
    tags: ['User'],
    security: [
      {
        BearerAuth: [],
      },
    ],
    responses: {
      200: {
        description: 'List of users information.',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: {
                    type: 'string',
                    description: 'The unique identifier for the user.',
                    example: '12345',
                  },
                  username: {
                    type: 'string',
                    description: 'The username of the user.',
                    example: 'john_doe',
                  },
                  email: {
                    type: 'string',
                    description: 'The email address of the user.',
                    example: 'john@example.com',
                  },
                  // Add more properties as needed
                },
              },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized. User must be authenticated.',
      },
    },
  },
}

export default getUser
