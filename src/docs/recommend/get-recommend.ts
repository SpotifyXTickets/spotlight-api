export const getRecommend = {
  get: {
    summary: 'Get recommendations.',
    description:
      'Retrieve recommendations based on user preferences and playlist selection.',
    tags: ['Recommendations'],
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
        description: 'A list of recommended events.',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Recommend',
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

export default getRecommend
