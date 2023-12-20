/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express'

/** Base class with the base functions for determining routes etc. */
export class AppController {
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
