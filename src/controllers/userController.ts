import isErrorResponse from '../helpers/isErrorResponse'
import { UserLogic } from '../logics/userLogic'
import { Authenticated } from '../middlewares/authenticationMiddleware'
import { User } from '../models/user'
import { AppController } from './appController'
import { Request, Response } from 'express'

export class UserController extends AppController {
  private userLogic: UserLogic
  constructor() {
    super()
    this.userLogic = new UserLogic()

    this.setRoutes([
      {
        uri: '/',
        middlewares: [Authenticated],
        method: this.getUser.bind(this),
      },
      {
        uri: '/:id',
        HttpMethod: 'DELETE',
        middlewares: [Authenticated],
        method: this.deleteUser.bind(this),
      },
    ])
  }

  /**
   * @swagger
   * path:
   *   /user:
   *     get:
   *       summary: Get user information.
   *       description: Retrieve user information.
   *       tags: [User]
   *       security:
   *         - BearerAuth: []
   *       responses:
   *         200:
   *           description: User information.
   */
  public async getUser(
    req: Request,
    res: Response<{
      error?: {
        status: number
        message: string
      }
      user?: User
    }>,
  ): Promise<void> {
    const user = await this.userLogic.getUser(
      req.headers.authorization!.split(' ')[1],
    )

    if (isErrorResponse(user)) {
      res.status(user.status).json({
        error: {
          status: user.status,
          message: user.message,
        },
      })
      return
    }
    res.status(200).send(user)
  }

  /**
   * @swagger
   * path:
   *   /user/:id:
   *     delete:
   *       summary: Delete user data from application.
   *       description: Delete the current users account from application.
   *       tags: [User]
   *       security:
   *         - BearerAuth: []
   *       responses:
   *         200:
   *           description: A deleted user
   */
  public async deleteUser(
    req: Request,
    res: Response<{
      error?: {
        status: number
        message: string
      }
      acknowledged: boolean
    }>,
  ): Promise<void> {
    const userId = req.params.id
    const result = await this.userLogic.deleteUser(userId)

    if (isErrorResponse(result)) {
      res.status(result.status).json({
        error: {
          status: result.status,
          message: result.message,
        },
        acknowledged: false,
      })
      return
    }
    res.status(200).json({
      acknowledged: true,
    })
    return
  }
}

export default UserController
