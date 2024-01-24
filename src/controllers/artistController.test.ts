import { ArtistController } from './artistController'
import { ArtistLogic } from '../logics/artistLogic'
import Container from 'typedi'
import { faker } from '@faker-js/faker'
import Artist from '../models/artist'
import { ObjectId } from 'mongodb'
import 'reflect-metadata'
import {
  MockResponse,
  MockRequest,
  createResponse,
  createRequest,
} from 'node-mocks-http'
import { Request, Response } from 'express'

describe('ArtistController', () => {
  let artistController: ArtistController
  let res: MockResponse<Response>
  let req: MockRequest<Request>

  beforeAll(() => {
    const artistLogic = Container.get(ArtistLogic)
    jest.spyOn(artistLogic, 'getArtists').mockImplementation(async () => {
      const artists: Artist[] = []
      for (let i = 0; i < 3; i++) {
        const artist: Artist = {
          _id: new ObjectId(faker.database.mongodbObjectId()),
          spotifyId: faker.string.uuid(),
          ticketMasterId: faker.string.uuid(),
          genres: [faker.music.genre(), faker.music.genre()],
          name: faker.person.fullName(),
          imageUrl: faker.image.url(),
          meanScore: faker.number.float({ min: 0, max: 5, precision: 0.01 }),
          socialMedia: {
            website: faker.internet.url(),
            facebook: faker.internet.url(),
            twitter: faker.internet.url(),
            instagram: faker.internet.url(),
            youtube: faker.internet.url(),
            spotify: faker.internet.url(),
            lastfm: faker.internet.url(),
          },
        }
        artists.push(artist)
      }
      return artists
    })
    jest
      .spyOn(artistLogic, 'getArtistById')
      .mockImplementation(async (id: string) => {
        return {
          _id: new ObjectId(id),
          spotifyId: faker.string.uuid(),
          ticketMasterId: faker.string.uuid(),
          genres: [faker.music.genre(), faker.music.genre()],
          name: faker.person.fullName(),
          imageUrl: faker.image.url(),
          meanScore: faker.number.float({ min: 0, max: 5, precision: 0.01 }),
          socialMedia: {
            website: faker.internet.url(),
            facebook: faker.internet.url(),
            twitter: faker.internet.url(),
            instagram: faker.internet.url(),
            youtube: faker.internet.url(),
            spotify: faker.internet.url(),
            lastfm: faker.internet.url(),
          },
        } as Artist
      })
    jest
      .spyOn(artistLogic, 'getArtistBySpotifyId')
      .mockImplementation(async (spotifyId: string) => {
        return {
          _id: new ObjectId(faker.database.mongodbObjectId()),
          spotifyId: spotifyId,
          ticketMasterId: faker.string.uuid(),
          genres: [faker.music.genre(), faker.music.genre()],
          name: faker.person.fullName(),
          imageUrl: faker.image.url(),
          meanScore: faker.number.float({ min: 0, max: 5, precision: 0.01 }),
          socialMedia: {
            website: faker.internet.url(),
            facebook: faker.internet.url(),
            twitter: faker.internet.url(),
            instagram: faker.internet.url(),
            youtube: faker.internet.url(),
            spotify: faker.internet.url(),
            lastfm: faker.internet.url(),
          },
        } as Artist
      })
    Container.set(ArtistLogic, artistLogic)
    artistController = new ArtistController()
  })

  beforeEach(() => {
    res = createResponse()
  })

  describe('getArtists', () => {
    it('should return a list of artists', async () => {
      // Mock the necessary dependencies and setup the test data

      req = createRequest({ method: 'GET', url: '/artist' })
      // Call the method being tested
      await artistController.getArtists(req, res)

      // Assert the expected behavior or outcome
      // Add your assertions here
      expect(res.statusCode).toBe(200)
      expect(res._getData().length).toBe(3)
    })
  })

  describe('getArtistById', () => {
    it('should return an 500 because invalid bson format', async () => {
      // Mock the necessary dependencies and setup the test data

      req = createRequest({
        method: 'GET',
        url: '/artist/123',
        params: { id: '123' },
      })
      // Call the method being tested
      await artistController.getArtistById(req, res)

      // Assert the expected behavior or outcome
      // Add your assertions here
      expect(res.statusCode).toBe(500)
      expect(res._getData()).toStrictEqual({
        status: 500,
        message: 'Something went wrong while trying to get artist with id 123',
      })
    })
    it('should return an artist with the same id', async () => {
      // Mock the necessary dependencies and setup the test data

      const id = faker.database.mongodbObjectId()
      req = createRequest({
        method: 'GET',
        url: '/artist/' + id,
        params: { id },
      })
      // Call the method being tested
      await artistController.getArtistById(req, res)

      // Assert the expected behavior or outcome
      // Add your assertions here
      expect(res.statusCode).toBe(200)
      expect(res._getData()._id).toStrictEqual(new ObjectId(id))
    })
  })
})
