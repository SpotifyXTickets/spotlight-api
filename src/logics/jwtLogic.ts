import { SignJWT, jwtVerify } from 'jose'

type JWTTokenType = {
  spotify?: {
    accessToken: string
    tokenType: string
    expiresIn: number
    createdAt: Date
    updatedAt: Date
    refreshToken: string
    scope: string
  }
  eventix?: {
    accessToken: string
    tokenType: string
    expiresIn: number
    refreshToken: string
    scope: string
  }
  ticketmaster?: {
    accessToken: string
  }
}
export default class JwtLogic {
  private getJWTSecretKey = () => {
    const secret = process.env.JWT_SECRET_KEY

    if (!secret) {
      throw new Error('JWT secret key is not matched')
    }

    return new TextEncoder().encode(secret)
  }
  public async getAccessTokensFromJWT(jwtToken: string) {
    const jwt = await jwtVerify(jwtToken, this.getJWTSecretKey() ?? '')
    console.log(jwt.payload)
  }

  public async generateJWTToken() {
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2m')
      .sign(this.getJWTSecretKey() ?? '')

    return jwt
  }
}
