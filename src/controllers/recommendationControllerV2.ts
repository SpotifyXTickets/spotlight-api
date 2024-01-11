import { Request, Response } from 'express'
import { AppController } from './appController'
import RecommendationsLogicV2 from '../logics/recommendationLogicV2'
import { Authenticated } from '../middlewares/authenticationMiddleware'

export const maxDuration = 30
export default class RecommendationControllerV2 extends AppController {
  constructor() {
    super()

    this.setRoutes([
      {
        uri: '/',
        middlewares: [Authenticated],
        method: this.recommendEvent,
      },
    ])
  }

  public async recommendEvent(req: Request, res: Response): Promise<void> {
    if (req.headers.authorization === undefined) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const playlistIds = req.query.playlistIds
      ? ((req.query.playlistIds as string).split(',') as string[])
      : []
    // Data order should be [Danceability, Energy, Loudness, Speechiness, Acousticness, Instrumentalness, Liveness, Valence, Tempo]
    // All data should be scaled down to a value between 0 and 1

    const apiKey = req.headers.authorization!.split(' ')[1]
    const recommendationsLogic = new RecommendationsLogicV2()
    const events = await recommendationsLogic.recommendEvent(
      apiKey,
      playlistIds,
    )

    res.send(events.slice(0, 30))
  }
}

module.exports = RecommendationControllerV2
