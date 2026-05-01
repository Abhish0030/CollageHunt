import type { NextFunction, Request, Response } from "express";
import { getTokenCookieName, verifyToken } from "../utils/auth";
import { AppError } from "../utils/api";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies[getTokenCookieName()] ??
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new AppError(401, "UNAUTHORIZED", "Please log in to continue");
    }

    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError(401, "UNAUTHORIZED", "Please log in to continue"));
  }
};
