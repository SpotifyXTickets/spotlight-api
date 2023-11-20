import jwt from 'jwt-simple'
export default class AuthenticationRepository {
  private static fakeDatabase: {
    auth: Array<{
      accessToken: string
      spotify: {
        accessToken: string
        tokenType: string
        expiresIn: number
        createdAt: Date
        updatedAt: Date
        refreshToken: string
        scope: string
      }
    }>
    authState: { state: string; redirectUrl: string }
  } = { auth: [], authState: { state: '', redirectUrl: '' } }
  public SetSpotifyAuthState(state: string, redirectUrl: string) {
    AuthenticationRepository.fakeDatabase.authState = {
      state,
      redirectUrl,
    }
  }
  public GetSpotifyAuthState(state: string) {
    return AuthenticationRepository.fakeDatabase.authState
  }
  public InsertSpotifyAuth(spotify: {
    accessToken: string
    tokenType: string
    expiresIn: number
    refreshToken: string
    scope: string
  }): string {
    const randomString = (Math.random() + 1).toString(36).substring(7)
    const token = jwt.encode(
      {
        spotify: {
          accessToken: spotify.accessToken,
          tokenType: spotify.tokenType,
          expiresIn: spotify.expiresIn,
          createdAt: new Date(),
          updatedAt: new Date(),
          refreshToken: spotify.refreshToken,
          scope: spotify.scope,
        },
      },
      randomString,
    )
    AuthenticationRepository.fakeDatabase.auth.push({
      accessToken: token,
      spotify: {
        accessToken: spotify.accessToken,
        tokenType: spotify.tokenType,
        expiresIn: spotify.expiresIn,
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshToken: spotify.refreshToken,
        scope: spotify.scope,
      },
    })

    return token
  }
  public UpdateSpotifyAuth(
    accessToken: string,
    spotify: {
      accessToken: string
      tokenType: string
      expiresIn: number
      refreshToken: string
      scope: string
    },
  ) {
    const index = AuthenticationRepository.fakeDatabase.auth.findIndex(
      (a) => a.accessToken === accessToken,
    )
    const randomString = (Math.random() + 1).toString(36).substring(7)
    const token = jwt.encode(
      {
        spotify: {
          accessToken: spotify.accessToken,
          tokenType: spotify.tokenType,
          expiresIn: spotify.expiresIn,
          createdAt: new Date(),
          updatedAt: new Date(),
          refreshToken: spotify.refreshToken,
          scope: spotify.scope,
        },
      },
      randomString,
    )
    AuthenticationRepository.fakeDatabase.auth[index] = {
      accessToken: token,
      spotify: {
        accessToken: spotify.accessToken,
        tokenType: spotify.tokenType,
        expiresIn: spotify.expiresIn,
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshToken: spotify.refreshToken,
        scope: spotify.scope,
      },
    }

    return token
  }
  public getAuth(accessToken: string) {
    return (
      AuthenticationRepository.fakeDatabase.auth.find(
        (a) => a.accessToken === accessToken,
      ) ?? null
    )
  }
  public GetSpotifyAuth() {
    return AuthenticationRepository.fakeDatabase.auth[0] ?? null
  }
}
