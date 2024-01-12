export const getSettings = {
  get: {
    summary: 'Get user settings.',
    description: 'Retrieve user settings for the authenticated user.',
    tags: ['Settings'],
    security: [
      {
        BearerAuth: [],
      },
    ],
    parameters: [
      {
        in: 'path',
        name: 'id',
        description: 'User ID.',
        required: true,
        schema: {
          type: 'string',
        },
      },
    ],
    responses: {
      200: {
        description: 'User settings retrieved successfully.',
      },
      401: {
        description: 'Unauthorized.',
      },
      404: {
        description: 'User not found.',
      },
    },
  },
}

export default getSettings
