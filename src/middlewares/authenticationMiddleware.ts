import { Request, Response, NextFunction } from "express";
import AuthenticationLogic from "../logics/authenticationLogic";

export const Authenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authenticationLogic = new AuthenticationLogic();
  if (authenticationLogic.CheckAuthorization(req, res)) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
  // await authenticationLogic.AuthorizeSpotify(req, res);

  next();
};
export const NotAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authenticationLogic = new AuthenticationLogic();
  if (!authenticationLogic.CheckAuthorization(req, res)) {
    next();
  }
  res.status(401).json({ error: "Already authenticated" });
};
