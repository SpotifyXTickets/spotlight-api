export const getRecommend2 = {
  get: {
    summary: 'Get additional recommendations (Version 2).',
    description:
      'Retrieve additional recommended events based on user preferences and playlist selection (Version 2).',
    tags: ['RecommendationsV2'],
    security: [
      {
        BearerAuth: [],
      },
    ],
    parameters: [
      {
        in: 'query',
        name: 'playlistIds',
        description: 'Comma-separated list of playlist IDs.',
        required: false,
        schema: {
          type: 'string',
        },
      },
    ],
    responses: {
      200: {
        description: 'A list of additional recommended events.',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Recommend2',
              },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized.',
      },
    },
  },
}

export default getRecommend2
