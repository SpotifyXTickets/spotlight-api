import { Collection, Db } from 'mongodb'
import { DB } from '../db'
import SpotifyLogic from '../logics/spotifyLogic'
import { Server } from 'http'
import express, { Application, Request, Response } from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'

dotenv.config()

const obtainRefreshToken = async (backendTokenCollection: Collection) => {
  const spotifyLogic = new SpotifyLogic()
  const token = await backendTokenCollection.findOne({})
  if (token === null) {
    console.error('No token present')
    process.exit(1)
  }
  const tokenResponse = await spotifyLogic.RefreshAuthorization({
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
  })
  await backendTokenCollection.updateOne(
    {},
    {
      $set: {
        accessToken: tokenResponse,
        refreshToken: token.refreshToken,
      },
    },
  )
  return tokenResponse
}

export async function obtainBackendToken(
  db: Db,
  callback: (apiKey: string) => Promise<void>,
) {
  const collectionTokens = db.collection('backendTokens')
  const spotifyLogic = new SpotifyLogic()
  // Checking if token is already present.
  const token = await collectionTokens.findOne({})

  if (token === null) {
    let server: Server | boolean = false
    // When token not present we will first host an express listen till code obtained from user executing command.
    const app: Application = express()
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))

    app.get('/spotify_authorizer', async (req: Request, res: Response) => {
      const code = req.query.code
      const state = req.query.state
      if (code && state) {
        console.log(req.query)
        const tokenResponse = await spotifyLogic.RequestAccessToken(
          code as string,
          state as string,
          'http://localhost:5000/',
        )

        if (tokenResponse.error !== null) {
          console.error(tokenResponse.error)
          res.status(400).send(tokenResponse.error)
          ;(server as Server).close()
          process.exit(1)
          return
        }
        await db.collection('backendTokens').insertOne({
          accessToken: tokenResponse.accessToken,
          expiresIn: tokenResponse.expiresIn,
          refreshToken: tokenResponse.refreshToken,
        })
        app.removeAllListeners()
        res.send('Token obtained!')
        ;(server as Server).close()
        const tResponse = await obtainRefreshToken(
          db.collection('backendTokens'),
        )
        return await callback(tResponse as string)
      } else {
        await spotifyLogic.RequestAuthorization(
          req,
          res,
          'http://localhost:5000/',
        )
        return
      }
    })

    server = app.listen(5000, () => {
      console.log(
        'Temporary accessToken url http://localhost:5000/spotify_authorizer',
      )
    })
    return
  }

  const tResponse = await obtainRefreshToken(db.collection('backendTokens'))
  return await callback(tResponse as string)
}

;(async () => {
  try {
    if (require.main !== module) return
    await DB.connect()

    const db = await DB.getDB()
    await obtainBackendToken(db, async (apiKey) => {
      console.log('API Key:', apiKey)
    })
  } catch (error) {
    console.log(error)
  }
})()
