// Import the necessary modules and classes
import { Request, Response } from 'express'
import { Authenticated } from '../middlewares/authenticationMiddleware'
import { AppController } from './appController'

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Endpoints related to user settings
 */

/**
 * @swagger
 * path:
 *   /settings/{id}:
 *     get:
 *       summary: Get user settings.
 *       description: Retrieve user settings for the authenticated user.
 *       tags: [Settings]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           description: User ID.
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: User settings retrieved successfully.
 *         401:
 *           description: Unauthorized.
 *         404:
 *           description: User not found.
 */
export class SettingController extends AppController {
  constructor() {
    super()

    this.setRoutes([
      {
        uri: '/:id',
        middlewares: [Authenticated],
        method: this.getUserSettings.bind(this),
      },
      {
        uri: '/:id',
        HttpMethod: 'PUT',
        middlewares: [Authenticated],
        method: this.updateUserSettings.bind(this),
      },
    ])
  }

  /**
   * @swagger
   * path:
   *   /settings/{id}:
   *     get:
   *       summary: Get user settings.
   *       description: Retrieve user settings for the authenticated user.
   *       tags: [Settings]
   *       security:
   *         - BearerAuth: []
   *       parameters:
   *         - in: path
   *           name: id
   *           description: User ID.
   *           required: true
   *           schema:
   *             type: string
   *       responses:
   *         200:
   *           description: User settings retrieved successfully.
   *         401:
   *           description: Unauthorized.
   *         404:
   *           description: User not found.
   */
  public async getUserSettings(req: Request, res: Response): Promise<void> {
    throw new Error('Not implemented')
  }

  /**
   * @swagger
   * path:
   *   /settings/{id}:
   *     put:
   *       summary: Update user settings.
   *       description: Update user settings for the authenticated user.
   *       tags: [Settings]
   *       security:
   *         - BearerAuth: []
   *       parameters:
   *         - in: path
   *           name: id
   *           description: User ID.
   *           required: true
   *           schema:
   *             type: string
   *       responses:
   *         200:
   *           description: User settings updated successfully.
   *         401:
   *           description: Unauthorized.
   *         404:
   *           description: User not found.
   */
  public async updateUserSettings(req: Request, res: Response): Promise<void> {
    throw new Error('Not implemented')
  }
}

export default SettingController
