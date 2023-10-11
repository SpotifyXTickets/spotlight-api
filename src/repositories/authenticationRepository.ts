export default class AuthenticationRepository {
  private static fakeDatabase: {
    auth: Array<{
      accessToken: string;
      tokenType: string;
      expiresIn: number;
      createdAt: Date;
      updatedAt: Date;
      refreshToken: string;
      scope: string;
    }>;
    authState: { state: string; redirectUrl: string };
  } = { auth: [], authState: { state: "", redirectUrl: "" } };
  public SetSpotifyAuthState(state: string, redirectUrl: string) {
    AuthenticationRepository.fakeDatabase.authState = {
      state,
      redirectUrl,
    };
  }
  public GetSpotifyAuthState(state: string) {
    return AuthenticationRepository.fakeDatabase.authState;
  }
  public InsertSpotifyAuth(
    accessToken: string,
    tokenType: string,
    expiresIn: number,
    refreshToken: string,
    scope: string
  ) {
    AuthenticationRepository.fakeDatabase.auth.push({
      accessToken,
      tokenType,
      expiresIn,
      createdAt: new Date(),
      updatedAt: new Date(),
      refreshToken,
      scope,
    });
  }
  public UpdateSpotifyAuth(
    accessToken: string,
    tokenType: string,
    expiresIn: number,
    refreshToken: string,
    scope: string
  ) {
    AuthenticationRepository.fakeDatabase.auth[0] = {
      accessToken,
      tokenType,
      expiresIn,
      createdAt: new Date(),
      updatedAt: new Date(),
      refreshToken,
      scope,
    };
  }
  public GetSpotifyAuth() {
    console.log(AuthenticationRepository.fakeDatabase.auth);
    return AuthenticationRepository.fakeDatabase.auth[0] ?? null;
  }
}
