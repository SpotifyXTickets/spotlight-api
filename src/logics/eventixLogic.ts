import axios from 'axios'

export default class EventixLogic {
  public RequestAuthorization() {
    const state = 'randomstring'

    axios
      .get('https://auth.openticket.tech/token/authorize', {
        params: {
          client_id: process.env.EVENTIX_CLIENT_ID,
          redirect_uri: process.env.EVENTIX_REDIRECT_URI,
          state: state,
          response_type: 'code',
        },
      })
      .then((response) => {
        console.log(response)
      })
      .catch((error) => {
        console.log(error.request)
        console.log(error.code)
      })
  }

  public RequestAccessToken() {
    axios
      .post('https://auth.eventix.io/token', {
        params: {
          client_id: 'eventix-website',
          redirect_uri: 'https://eventix.io',
          state: 'randomstring',
          response_type: 'code',
        },
      })
      .then((response) => {
        console.log(response)
      })
      .catch((error) => {
        console.log(error)
      })
  }
  // Class properties and methods go here
}
