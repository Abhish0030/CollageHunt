import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "./api";

const TOKEN_COOKIE = "collagehunt_token";

export interface UserJwtPayload {
  userId: number;
  email: string;
  name: string;
  authProvider?: "credentials" | "auth0";
}

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, "INTERNAL_SERVER_ERROR", "JWT secret is not configured");
  }
  return secret;
};

export const hashPassword = async (password: string) => bcrypt.hash(password, 10);

export const comparePassword = async (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const signToken = (payload: UserJwtPayload) =>
  jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });

export const verifyToken = (token: string) =>
  jwt.verify(token, getJwtSecret()) as UserJwtPayload;

export const getTokenCookieName = () => TOKEN_COOKIE;

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});
