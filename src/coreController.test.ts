import { CoreController } from './coreController'
import { Request, Response } from 'express'

describe('CoreController', () => {
  let coreController: CoreController

  beforeEach(() => {
    coreController = new CoreController()
  })

  it('should return an array of routes', () => {
    const routes = coreController.getRoutes()
    expect(Array.isArray(routes)).toBe(true)
  })

  it('should set the routes correctly', () => {
    const routes = [
      {
        uri: '/test',
        method: (req: Request, res: Response) => {
          res.send('Test route')
        },
      },
    ]

    coreController.setRoutes(routes)

    const updatedRoutes = coreController.getRoutes()
    expect(updatedRoutes).toEqual(routes)
  })
})
