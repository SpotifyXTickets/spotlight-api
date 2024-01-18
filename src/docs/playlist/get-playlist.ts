export const getPlaylist = {
  get: {
    tags: ['Playlist'],
    operationId: 'getPlaylist',
    responses: {
      200: {
        description: 'List of user playlists obtained.',
        content: {
          // content-type
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Playlist',
              },
            },
          },
        },
      },
      // response code
      400: {
        description: 'Bad request or something went wrong.',
        content: {
          // content-type
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  example: 'Something went wrong.',
                },
              },
            },
          },
        },
      },
    },
  },
}

export default getPlaylist
