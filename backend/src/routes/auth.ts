import { Router } from "express";
import { z } from "zod";
import {
  auth0Enabled,
  getAuth0CallbackUrl,
  getAuth0LogoutUrl,
  getAuth0WebOrigin,
  startAuth0Login,
  startAuth0Logout,
  startAuth0Signup,
} from "../lib/auth0";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/authMiddleware";
import { AppError, sendCreated, sendSuccess } from "../utils/api";
import {
  comparePassword,
  getCookieOptions,
  getTokenCookieName,
  hashPassword,
  signToken,
} from "../utils/auth";

const router = Router();

const normalizePhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return digits;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  throw new AppError(400, "BAD_REQUEST", "Enter a valid 10-digit mobile number");
};

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(10).max(16).transform(normalizePhoneNumber),
  city: z.string().trim().min(2).max(80),
  studyingIn: z.string().trim().min(2).max(80),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/\d/, "Include at least one number")
    .regex(/[^A-Za-z0-9]/, "Include at least one special character"),
});

const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(120),
  password: z.string().min(8).max(128),
});

router.get("/auth0/enabled", async (_req, res, next) => {
  try {
    return sendSuccess(res, { enabled: auth0Enabled() });
  } catch (error) {
    next(error);
  }
});

router.get("/auth0/config", async (_req, res, next) => {
  try {
    return sendSuccess(res, {
      enabled: auth0Enabled(),
      callbackUrl: getAuth0CallbackUrl(),
      logoutUrl: getAuth0LogoutUrl(),
      webOrigin: getAuth0WebOrigin(),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/auth0/login", async (req, res, next) => {
  try {
    if (!auth0Enabled()) {
      throw new AppError(503, "BAD_REQUEST", "Auth0 is not configured");
    }

    await startAuth0Login(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/auth0/signup", async (req, res, next) => {
  try {
    if (!auth0Enabled()) {
      throw new AppError(503, "BAD_REQUEST", "Auth0 is not configured");
    }

    await startAuth0Signup(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/auth0/logout", async (req, res, next) => {
  try {
    if (!auth0Enabled()) {
      throw new AppError(503, "BAD_REQUEST", "Auth0 is not configured");
    }

    await startAuth0Logout(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: payload.email }, { phone: payload.phone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === payload.email) {
        throw new AppError(409, "CONFLICT", "An account with this email already exists");
      }

      throw new AppError(409, "CONFLICT", "An account with this mobile number already exists");
    }

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        city: payload.city,
        studyingIn: payload.studyingIn,
        passwordHash: await hashPassword(payload.password),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        studyingIn: true,
        createdAt: true,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      authProvider: "credentials",
    });

    res.cookie(getTokenCookieName(), token, getCookieOptions());
    return sendCreated(res, user);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const normalizedIdentifier = payload.identifier.trim();
    const isEmailLogin = normalizedIdentifier.includes("@");

    const user = await prisma.user.findFirst({
      where: isEmailLogin
        ? { email: normalizedIdentifier.toLowerCase() }
        : { phone: normalizePhoneNumber(normalizedIdentifier) },
    });

    if (!user || !(await comparePassword(payload.password, user.passwordHash))) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid credentials");
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      authProvider: "credentials",
    });

    res.cookie(getTokenCookieName(), token, getCookieOptions());
    return sendSuccess(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      studyingIn: user.studyingIn,
      createdAt: user.createdAt,
      authProvider: "credentials",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", async (_req, res, next) => {
  try {
    res.clearCookie(getTokenCookieName(), {
      ...getCookieOptions(),
      maxAge: undefined,
    });
    return sendSuccess(res, { loggedOut: true });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        studyingIn: true,
        createdAt: true,
        _count: {
          select: {
            saved: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, "NOT_FOUND", "User not found");
    }

    return sendSuccess(res, {
      ...user,
      authProvider: req.user?.authProvider ?? "credentials",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
