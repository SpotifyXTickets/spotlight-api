import { ObjectId } from 'bson'

export type AccessToken = {
  _id: ObjectId // Will be the same as the spotifyId
  accessToken: string
  spotifyAccessToken: string
  createdAt: Date
  updatedAt: Date
  expiresIn: number
  refreshToken: string
}

export default AccessToken
