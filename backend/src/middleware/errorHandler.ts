import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { clearAuthCookies, getFrontendOrigin, isAllowedFrontendOrigin } from "../lib/auth0";
import { AppError } from "../utils/api";

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(404, "NOT_FOUND", "Resource not found"));
};

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: error.issues[0]?.message ?? "Invalid request",
      },
    });
  }

  console.error(error);

  const isDevelopment = process.env.NODE_ENV !== "production";
  const errorMessage =
    typeof error === "object" && error !== null && "message" in error && typeof error.message === "string"
      ? error.message
      : "Something went wrong. Please try again.";

  const originHeader = typeof req.headers.origin === "string" ? req.headers.origin : null;
  const frontendOrigin =
    originHeader && isAllowedFrontendOrigin(originHeader) ? originHeader : getFrontendOrigin();
  const isAuth0CallbackRequest = req.originalUrl.includes("/api/auth/auth0/callback");
  const isAuth0VerificationError =
    isAuth0CallbackRequest &&
    errorMessage.includes("cookie not found") &&
    errorMessage.includes("Ensure the login flow is initiated through the SDK's login route");
  const isAuth0CancelledLogin =
    isAuth0CallbackRequest &&
    (errorMessage.toLowerCase().includes("access_denied") ||
      errorMessage.toLowerCase().includes("user cancelled") ||
      errorMessage.toLowerCase().includes("authorization failed"));

  if (isAuth0VerificationError) {
    clearAuthCookies(res);
    return res.redirect(
      302,
      `${frontendOrigin}/colleges?auth=login&redirect=/colleges&authError=${encodeURIComponent("auth0-restart")}`,
    );
  }

  if (isAuth0CancelledLogin) {
    clearAuthCookies(res);
    return res.redirect(
      302,
      `${frontendOrigin}/colleges?auth=login&redirect=/colleges&authError=${encodeURIComponent("auth0-cancelled")}`,
    );
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: isDevelopment ? errorMessage : "Something went wrong. Please try again.",
    },
  });
};
