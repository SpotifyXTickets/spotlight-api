export const getSpotify = {
  // operation's method
  get: {
    tags: ["Get Spotify"], // operation's tag.
    description: "Retrieve the home page content.",
    security: [{ BearerAuth: [] }],
    responses: {
      200: {
        description: "Home page content.",
        content: {
          "text/plain": {
            schema: {
              type: "string",
            },
          },
        },
      },
      500: {
        description: "Internal server error.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Error occurred while fetching home page content.",
                },
              },
            },
          },
        },
      },
    },
  },

  // Get Artists
  getArtists: {
    description: "Retrieve a list of artists.",
    security: [{ BearerAuth: [] }],
    responses: {
      200: {
        description: "A list of artists.",
      },
      500: {
        description: "Internal server error.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Error occurred while fetching artists.",
                },
              },
            },
          },
        },
      },
    },
  },

  // Get User
  getUser: {
    description: "Retrieve user information.",
    security: [{ BearerAuth: [] }],
    responses: {
      200: {
        description: "User information.",
      },
      500: {
        description: "Internal server error.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Error occurred while fetching user information.",
                },
              },
            },
          },
        },
      },
    },
  },

  // Authorize User
  authorize: {
    description: "Authorize user for the application.",
    security: [{ BearerAuth: [] }],
    responses: {
      200: {
        description: "Authorization response.",
      },
      500: {
        description: "Internal server error.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Error occurred during authorization.",
                },
              },
            },
          },
        },
      },
    },
  },

  // Get Playlists
  getPlaylists: {
    description: "Retrieve playlists of the authenticated user.",
    security: [{ BearerAuth: [] }],
    responses: {
      200: {
        description: "A list of user playlists.",
      },
      500: {
        description: "Internal server error.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Error occurred while fetching user playlists.",
                },
              },
            },
          },
        },
      },
    },
  },
};

export default getSpotify;
