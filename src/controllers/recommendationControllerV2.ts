import { Request, Response } from 'express'
import { CoreController } from '../coreController'
import RecommendationsLogicV2 from '../logics/recommendationLogicV2'
import { Authenticated } from '../middlewares/authenticationMiddleware'

/**
 * @swagger
 * tags:
 *   name: RecommendationsV2
 *   description: Endpoints related to version 2 of recommendations
 */

export const maxDuration = 30
export default class RecommendationControllerV2 extends CoreController {
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

  /**
   * @swagger
   * /recommendations-v2:
   *   get:
   *     summary: Get recommended events (Version 2).
   *     description: Retrieve recommended events based on user preferences and playlist selection (Version 2).
   *     tags: [RecommendationsV2]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: playlistIds
   *         description: Comma-separated list of playlist IDs.
   *         required: false
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: A list of recommended events.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Recommend2'
   *       401:
   *         description: Unauthorized.
   */
  public async recommendEvent(req: Request, res: Response): Promise<void> {
    if (req.headers.authorization === undefined) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const playlistIds = req.query.playlistIds
      ? (req.query.playlistIds as string).split(',')
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
