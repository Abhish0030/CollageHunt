import type { Response } from "express";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  statusCode: number;
  code: ApiErrorCode;

  constructor(statusCode: number, code: ApiErrorCode, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  meta?: Record<string, number | string | boolean | null>,
) => {
  return res.status(200).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
};

export const sendCreated = <T>(res: Response, data: T) => {
  return res.status(201).json({
    success: true,
    data,
  });
};
