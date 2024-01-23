import router from './routes'
import { ArtistController } from './controllers/artistController'
import EventController from './controllers/eventController'
import RecommendationController from './controllers/recommendationController'
import HomeController from './controllers/homeController'
import AuthorizationController from './controllers/authorizationController'
import UserController from './controllers/userController'
import SettingController from './controllers/settingController'

describe('Routes', () => {
  it('should contain routes', async () => {
    const artistController = new ArtistController()
    const authorizationController = new AuthorizationController()
    const eventController = new EventController()
    const userController = new UserController()
    const homeController = new HomeController()
    const recommendationController = new RecommendationController()
    const settingController = new SettingController()

    let routeCount = 1 // Default route for Swagger UI
    routeCount += artistController.getRoutes().length
    routeCount += authorizationController.getRoutes().length
    routeCount += eventController.getRoutes().length
    routeCount += userController.getRoutes().length
    routeCount += homeController.getRoutes().length
    routeCount += recommendationController.getRoutes().length
    routeCount += settingController.getRoutes().length

    //We filter the route as express creates 3 routes somehow with no path :)
    const routerRoutes = router.stack.filter((r) => {
      return r.route && r.route.path
    })
    expect(routeCount).toBeGreaterThan(0)

    expect(router.stack).toEqual(expect.any(Array))
    expect(routerRoutes.length).toBeGreaterThan(0)
    expect(routerRoutes.length).toEqual(routeCount)
  })
})
