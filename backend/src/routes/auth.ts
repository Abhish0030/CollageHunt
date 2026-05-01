import { Router } from "express";
import { Prisma } from "../generated/prisma";
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

const userAuthSelect = {
  id: true,
  name: true,
  email: true,
  passwordHash: true,
  createdAt: true,
} as const;

const userProfileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  city: true,
  studyingIn: true,
  createdAt: true,
} as const;

const userProfileFallbackSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} as const;

const isMissingUserProfileColumnError = (error: unknown) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022") {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("column") &&
    (message.includes("phone") || message.includes("city") || message.includes("studyingin"))
  );
};

const toAuthResponseUser = <
  T extends {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    phone?: string | null;
    city?: string | null;
    studyingIn?: string | null;
  },
>(
  user: T,
) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone ?? null,
  city: user.city ?? null,
  studyingIn: user.studyingIn ?? null,
  createdAt: user.createdAt,
});

const findUserForAuth = async (identifier: string, isEmailLogin: boolean) => {
  if (isEmailLogin) {
    return prisma.user.findFirst({
      where: { email: identifier.toLowerCase() },
      select: userAuthSelect,
    });
  }

  return prisma.user.findFirst({
    where: { phone: normalizePhoneNumber(identifier) },
    select: userAuthSelect,
  });
};

const createUserProfile = async (payload: z.infer<typeof registerSchema>) => {
  try {
    return await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        city: payload.city,
        studyingIn: payload.studyingIn,
        passwordHash: await hashPassword(payload.password),
      },
      select: userProfileSelect,
    });
  } catch (error) {
    if (!isMissingUserProfileColumnError(error)) {
      throw error;
    }

    return prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        passwordHash: await hashPassword(payload.password),
      },
      select: userProfileFallbackSelect,
    });
  }
};

const findUserProfileById = async (userId: number) => {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...userProfileSelect,
        _count: {
          select: {
            saved: true,
          },
        },
      },
    });
  } catch (error) {
    if (!isMissingUserProfileColumnError(error)) {
      throw error;
    }

    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...userProfileFallbackSelect,
        _count: {
          select: {
            saved: true,
          },
        },
      },
    });
  }
};

router.get("/auth0/enabled", async (_req, res, next) => {
  try {
    return sendSuccess(res, { enabled: auth0Enabled() });
  } catch (error) {
    next(error);
  }
});

router.get("/auth0/config", async (_req, res, next) => {
  try {
    const enabled = auth0Enabled();
    return sendSuccess(res, {
      enabled,
      callbackUrl: enabled ? getAuth0CallbackUrl() : null,
      logoutUrl: enabled ? getAuth0LogoutUrl() : null,
      webOrigin: enabled ? getAuth0WebOrigin() : null,
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
    let existingUser = null;

    try {
      existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: payload.email }, { phone: payload.phone }],
        },
        select: {
          email: true,
        },
      });
    } catch (error) {
      if (!isMissingUserProfileColumnError(error)) {
        throw error;
      }

      existingUser = await prisma.user.findFirst({
        where: { email: payload.email },
        select: {
          email: true,
        },
      });
    }

    if (existingUser) {
      if (existingUser.email === payload.email) {
        throw new AppError(409, "CONFLICT", "An account with this email already exists");
      }

      throw new AppError(409, "CONFLICT", "An account with this mobile number already exists");
    }

    const user = await createUserProfile(payload);

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      authProvider: "credentials",
    });

    res.cookie(getTokenCookieName(), token, getCookieOptions());
    return sendCreated(res, toAuthResponseUser(user));
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const normalizedIdentifier = payload.identifier.trim();
    const isEmailLogin = normalizedIdentifier.includes("@");

    let user = null;

    try {
      user = await findUserForAuth(normalizedIdentifier, isEmailLogin);
    } catch (error) {
      if (!isMissingUserProfileColumnError(error)) {
        throw error;
      }

      if (!isEmailLogin) {
        throw new AppError(503, "BAD_REQUEST", "Phone login is temporarily unavailable");
      }

      user = await prisma.user.findFirst({
        where: { email: normalizedIdentifier.toLowerCase() },
        select: userAuthSelect,
      });
    }

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
    const fullUserProfile = await findUserProfileById(user.id);
    if (!fullUserProfile) {
      throw new AppError(404, "NOT_FOUND", "User not found");
    }

    return sendSuccess(res, {
      ...toAuthResponseUser(fullUserProfile),
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
    const user = await findUserProfileById(req.user!.userId);

    if (!user) {
      throw new AppError(404, "NOT_FOUND", "User not found");
    }

    return sendSuccess(res, {
      ...toAuthResponseUser(user),
      _count: user._count,
      authProvider: req.user?.authProvider ?? "credentials",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
