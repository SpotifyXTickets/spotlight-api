import { Authenticated } from '../middlewares/authenticationMiddleware'
import { AppController } from './appController'

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

  public async getUserSettings(): Promise<void> {
    throw new Error('Not implemented')
  }

  public async updateUserSettings(): Promise<void> {
    throw new Error('Not implemented')
  }
}

export default SettingController
