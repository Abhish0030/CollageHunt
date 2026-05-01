import type { UserJwtPayload } from "../utils/auth";

declare global {
  namespace Express {
    interface Request {
      user?: UserJwtPayload;
    }
  }
}

export {};
