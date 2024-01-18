/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express'

/**
 * @swagger
 * tags:
 *   name: Base
 *   description: Base class for handling routes
 */

/** Base class with the base functions for determining routes etc. */
export class CoreController {
  private routes: {
    uri: string
    HttpMethod?: string
    middlewares?: Array<
      (req: Request, res: Response, next: NextFunction) => void
    >
    method: (req: Request, res: Response) => void
  }[]

  constructor() {
    this.routes = []
  }

  /**
   * @swagger
   * /base/routes:
   *   get:
   *     summary: Get all routes configured in the AppController.
   *     description: Retrieve a list of all routes configured in the AppController.
   *     tags: [Base]
   *     responses:
   *       200:
   *         description: A list of routes.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   uri:
   *                     type: string
   *                   middlewares:
   *                     type: array
   *                     items:
   *                       type: string
   *                   method:
   *                     type: string
   *               example:
   *                 - uri: "/example"
   *                   middlewares: ["middleware1", "middleware2"]
   *                   method: "GET"
   */
  public getRoutes(): {
    uri: string
    HttpMethod?: string
    middlewares?: Array<
      (req: Request, res: Response, next: NextFunction) => void
    >
    method: (req: Request, res: Response) => void
  }[] {
    return this.routes ?? []
  }

  /**
   * @swagger
   * /base/routes:
   *   post:
   *     summary: Set new routes for the AppController.
   *     description: Set new routes for the AppController.
   *     tags: [Base]
   *     requestBody:
   *       description: List of routes to set.
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: object
   *               properties:
   *                 uri:
   *                   type: string
   *                 middlewares:
   *                   type: array
   *                   items:
   *                     type: string
   *                 method:
   *                   type: string
   *               example:
   *                 - uri: "/newroute"
   *                   middlewares: ["middleware3"]
   *                   method: "POST"
   *     responses:
   *       200:
   *         description: Routes set successfully.
   *       500:
   *         description: Internal server error.
   */
  public setRoutes(
    routes: {
      uri: string
      HttpMethod?: string
      middlewares?: Array<
        (req: Request, res: Response, next: NextFunction) => void
      >
      method: (req: Request, res: Response) => void
    }[],
  ): void {
    this.routes = routes
  }
}
