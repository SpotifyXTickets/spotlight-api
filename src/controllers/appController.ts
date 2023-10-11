import { NextFunction, Request, Response } from "express";

export class AppController {
  private routes: {
    uri: string;
    middlewares?: Array<
      (req: Request, res: Response, next: NextFunction) => any
    >;
    method: (req: Request, res: Response) => any;
  }[];
  constructor() {
    this.routes = [];
  }

  public getRoutes(): {
    uri: string;
    middlewares?: Array<
      (req: Request, res: Response, next: NextFunction) => any
    >;
    method: (req: Request, res: Response) => any;
  }[] {
    return this.routes ?? [];
  }

  public setRoutes(
    routes: {
      uri: string;
      middlewares?: Array<
        (req: Request, res: Response, next: NextFunction) => any
      >;
      method: (req: Request, res: Response) => any;
    }[]
  ): void {
    this.routes = routes;
  }
}
