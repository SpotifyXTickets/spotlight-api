import request from 'supertest'
import dotenv from 'dotenv'
import swaggerDocs from './docs'
import { DB } from './db'
import app from './index'

dotenv.config()

describe('Index', () => {
  afterAll(async () => {
    await DB.disconnect()
  })

  it('should return the Swagger documentation', async () => {
    const response = await request(app).get('/api-docs')
    expect(response.status).toBe(301)

    const response2 = await request(app).get('/api-docs/')
    expect(response2.status).toBe(200)

    const response3 = await request(app).get('/swagger.json')
    expect(response3.status).toBe(200)
    expect(response3.body).toEqual(swaggerDocs)
  })

  // Add more tests for your API routes here

  // ...
})
