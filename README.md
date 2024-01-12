
# Spotlight backend

This repository contains a typescript based proof of concept (POC) for the Spotlight backend. It is built with Node.js and Express.js, and uses Swagger for API documentation.

The backend provides our application with the ability to recommend events to users based on their spotify data. This is done through matching artists and by calculating cosine similiraty. The backend also provides other services like data fetching from spotify and ticketmaster.
## Getting started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- npm

### Installing

1. Clone the repository:

```
git clone https://github.com/SpotifyXTickets/spotify-poc-nodejs.git
```

2. Navigate into the cloned repository:

```
cd spotify-poc-backend
```

3. Install the dependencies:

```
npm install
```

4. Start the server:

```
npm start
```
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file
 
`SPOTIFY_CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID`

`SPOTIFY_CLIENT_SECRET=YOUR_SPOTIFY_CLIENT_SECRET`

`SPOTIFY_REDIRECT_URI=YOUR_SPOTIFY_REDIRECT_URI`

&nbsp;

`TICKET_MASTER_API_KEY=YOUR_TICKET_MASTER_API_KEY`

`TICKET_MASTER_SECRET=YOUR_TICKET_MASTER_SECRET`

&nbsp;

`SESSION_SECRET=YOUR_SESSION_SECRET`

`NODE_ENV=development`

&nbsp;

`JWT_SECRET_KEY=YOUR_JWT_SECRET_KEY`

`DB_USERNAME=YOUR_DB_USERNAME`

`DB_PASSWORD=YOUR_DB_PASSWORD`

`MONGODB_URL=YOUR_MONGODB_URL`

&nbsp;

`FRONTEND_ORIGIN=http://localhost:3000/`

`URL_ENDPOINT_MONGO=YOUR_URL_ENDPOINT_MONGO`

`DATA_SOURCE_MONGO=YOUR_DATA_SOURCE_MONGO`

`COLLECTION_NAME_MONGO=YOUR_COLLECTION_NAME_MONGO`

`DATABASE_NAME_MONGO=YOUR_DATABASE_NAME_MONGO`

`API_KEY_MONGO=YOUR_API_KEY_MONGO`

`CONTENT_TYPE_MONGO=json`

`MONGODB_COLLECTION_DB=YOUR_MONGODB_COLLECTION_DB`

`MONGODB_COLLECTION_LOGS=YOUR_MONGODB_COLLECTION_LOGS`

`MONGODB_DBNAME=YOUR_MONGODB_DBNAME`


## ESLint

In order to use ESLint run the following line:

```bash
npm run lint
```

In order to automatic fix issues while using ESLint run the following line:

```bash
npm run lint -- --fix
```

## Code Formatting

In order to use prettier run the following line:

```bash
npm run format
```

In order to check which files would be formatted without actually modifying them with prettier, run the following line:

```bash
npm run check-format
```
## Running Tests

To run tests, run the following command

```bash
  npm run test
```


## Features

- Event recommendation based on personal spotify data
- Data fetching from Spotify, Ticketmaster and our database.
- Authorizing through spotify


## API Documentation

The API documentation is available at the `/api-docs` endpoint, thanks to Swagger. You can view the documentation by starting the server and navigating to `http://localhost:8000/api-docs` in your web browser.
## Built With

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Swagger](https://swagger.io/)
- [MongoDB](https://www.mongodb.com)
- [Spotify web API](https://developer.spotify.com/documentation/web-api)
- [Ticketmaster API](https://developer.ticketmaster.com/products-and-docs/apis/getting-started/)


## Authors

- [@stijnveeke](https://github.com/stijnveeke) Lead back-end developer
- [@RafSchapendonk](https://github.com/RafSchapendonk) Data scientist
- [@FenChango](https://github.com/FenChango) Security officer

