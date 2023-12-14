import { ObjectId } from 'bson'

export type EmbeddednUser = User & {
  _embedded?: {
    // Add embedded models here
  }
}

export type User = {
  _id: ObjectId // Will be the same as the spotifyId
  country: string
  display_name: string
  email: string
  images: Array<{
    height: number
    url: string
    width: number
  }>
}
