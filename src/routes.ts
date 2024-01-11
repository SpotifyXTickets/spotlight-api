import express, { NextFunction, Router, Request, Response } from 'express'
import AuthController from './controllers/authorizationController'
import asyncify from 'express-asyncify'
import HomeController from './controllers/homeController'
import EventController from './controllers/eventController'
import RecommendationController from './controllers/recommendationController'
import RecommendationControllerV2 from './controllers/recommendationControllerV2'
import swaggerUi from 'swagger-ui-express' // Import Swagger UI package
import swaggerJsdoc from 'swagger-jsdoc'
import SettingController from './controllers/settingController'
import UserController from './controllers/userController'
import PlaylistController from './controllers/playlistController'
import { ArtistController } from './controllers/artistController'

function setRouterRoutes(
  router: Router,
  baseUri: string = '',
  routes: {
    uri: string
    HttpMethod?: string
    middlewares?: Array<
      (req: Request, res: Response, next: NextFunction) => void
    >
    method: (req: Request, res: Response) => void
  }[],
): void {
  routes
    .sort((a, b) => {
      if (a.uri.includes(':') && !b.uri.includes(':')) {
        return 1
      } else if (!a.uri.includes(':') && b.uri.includes(':')) {
        return -1
      } else {
        return 0
      }
    })
    .forEach((route) => {
      switch (route.HttpMethod ? route.HttpMethod.toUpperCase() : undefined) {
        case 'GET':
          router.get(baseUri + route.uri, route.middlewares ?? [], route.method)
          break
        case 'POST':
          router.post(
            baseUri + route.uri,
            route.middlewares ?? [],
            route.method,
          )
          break
        case 'PUT':
          router.put(baseUri + route.uri, route.middlewares ?? [], route.method)
          break
        case 'DELETE':
          router.delete(
            baseUri + route.uri,
            route.middlewares ?? [],
            route.method,
          )
          break
        default:
          router.get(baseUri + route.uri, route.middlewares ?? [], route.method)
          break
      }
    })
}

const router = asyncify(express.Router())
const authController = new AuthController()
setRouterRoutes(router, '/authorize', authController.getRoutes())

const homeController = new HomeController()
setRouterRoutes(router, '', homeController.getRoutes())

const eventController = new EventController()
setRouterRoutes(router, '/event', eventController.getRoutes())

const recommendationController = new RecommendationController()
setRouterRoutes(router, '/recommendation', recommendationController.getRoutes())

const settingController = new SettingController()
setRouterRoutes(router, '/setting', settingController.getRoutes())

const userController = new UserController()
setRouterRoutes(router, '/user', userController.getRoutes())

const playListController = new PlaylistController()
setRouterRoutes(router, '/playlist', playListController.getRoutes())

const artistController = new ArtistController()
setRouterRoutes(router, '/artist', artistController.getRoutes())

const recommendationControllerV2 = new RecommendationControllerV2()
const recommendationV2Routes = recommendationControllerV2.getRoutes()

recommendationV2Routes.forEach((route) => {
  router.get(
    '/recommendationsv2' + route.uri,
    route.middlewares ?? [],
    route.method,
  )
})

// Swagger options specifying API metadata and server details
const swaggerOptions: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: '3.0.0', // Use OpenAPI version 3.0.0
    info: {
      title: 'Spotify X TicketSwap', // Specify the title of your API
      version: '1.0.0', // Specify the version of your API
      description: 'API documentation for our application', // Provide a description for your API
    },
    servers: [
      {
        url: 'http://localhost:3000', // Specify the server URL where your API is hosted
      },
    ],
  },
  apis: ['./controllers/*.ts'], // Specify the path to include all your controller files for Swagger documentation
}

const swaggerDocs = swaggerJsdoc(swaggerOptions)

// Serve Swagger documentation at the "/api-docs" endpoint
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

export default router
