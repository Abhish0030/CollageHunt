import type { Request, Response } from "express";
import { auth, type ConfigParams } from "express-openid-connect";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import { getCookieOptions, getTokenCookieName, signToken } from "../utils/auth";

const DEFAULT_FRONTEND_ORIGIN = "http://localhost:3000";
const getConfiguredFrontendOrigin = () =>
  process.env.FRONTEND_ORIGIN ?? process.env.CORS_ORIGIN ?? DEFAULT_FRONTEND_ORIGIN;
const getBackendBaseUrl = () => process.env.BASE_URL ?? "http://localhost:4000";
const callbackPath = "/api/auth/auth0/callback";
const getGoogleConnectionName = () => process.env.AUTH0_GOOGLE_CONNECTION ?? "google-oauth2";
const getGooglePrompt = () => process.env.AUTH0_GOOGLE_PROMPT ?? "select_account";
const getIssuerBaseUrl = () => process.env.ISSUER_BASE_URL?.replace(/\/+$/, "");
const isProduction = () => process.env.NODE_ENV === "production";

const isAllowedLocalDevelopmentOrigin = (origin: string) => {
  if (isProduction()) {
    return false;
  }

  try {
    const parsedUrl = new URL(origin);
    const isLocalHost = ["localhost", "127.0.0.1"].includes(parsedUrl.hostname);
    return parsedUrl.protocol === "http:" && isLocalHost;
  } catch {
    return false;
  }
};

const isAllowedVercelOrigin = (origin: string) => {
  try {
    const parsedUrl = new URL(origin);
    return parsedUrl.protocol === "https:" && parsedUrl.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

export const getAllowedFrontendOrigins = () => {
  const configuredOrigins = (process.env.CORS_ORIGIN ?? DEFAULT_FRONTEND_ORIGIN)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const frontendOrigin = process.env.FRONTEND_ORIGIN?.trim();
  if (frontendOrigin && !configuredOrigins.includes(frontendOrigin)) {
    configuredOrigins.push(frontendOrigin);
  }

  return configuredOrigins.length > 0 ? configuredOrigins : [DEFAULT_FRONTEND_ORIGIN];
};

export const isAllowedFrontendOrigin = (origin: string) =>
  getAllowedFrontendOrigins().includes(origin) ||
  isAllowedLocalDevelopmentOrigin(origin) ||
  isAllowedVercelOrigin(origin);

export const getFrontendOrigin = () => getConfiguredFrontendOrigin();
const getAuth0HttpTimeout = () => {
  const rawValue = process.env.AUTH0_HTTP_TIMEOUT;

  if (!rawValue) {
    return 15000;
  }

  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) && parsedValue >= 500 ? parsedValue : 15000;
};

const buildAuthorizationParams = (provider?: string, mode?: string) => ({
  scope: "openid profile email",
  response_type: "code",
  response_mode: "query",
  ...(mode === "signup" ? { screen_hint: "signup" } : {}),
  ...(provider === "google"
    ? {
        connection: getGoogleConnectionName(),
        prompt: getGooglePrompt(),
        max_age: 0,
      }
    : {}),
});

const isConfigured = () =>
  Boolean(
    getIssuerBaseUrl() &&
      process.env.CLIENT_ID &&
      process.env.CLIENT_SECRET &&
      process.env.SECRET &&
      process.env.BASE_URL,
  );

const sanitizeReturnTo = (value: unknown) => {
  const frontendOrigin = getConfiguredFrontendOrigin();

  if (typeof value !== "string" || value.length === 0) {
    return frontendOrigin;
  }

  if (value.startsWith("/")) {
    return `${frontendOrigin}${value}`;
  }

  try {
    const parsedUrl = new URL(value);
    if (isAllowedFrontendOrigin(parsedUrl.origin)) {
      return value;
    }
  } catch {
    return frontendOrigin;
  }

  return frontendOrigin;
};

const getProfileClaims = (session: unknown) => {
  if (!session || typeof session !== "object" || !("id_token" in session)) {
    return null;
  }

  const idToken = session.id_token;

  if (typeof idToken !== "string" || idToken.length === 0) {
    return null;
  }

  const decodedToken = jwt.decode(idToken);
  if (!decodedToken || typeof decodedToken !== "object") {
    return null;
  }

  return decodedToken as {
    sub?: string;
    name?: string;
    nickname?: string;
    given_name?: string;
    family_name?: string;
    email?: string;
  };
};

export const auth0Enabled = () => isConfigured();
export const getAuth0CallbackUrl = () => `${getBackendBaseUrl()}${callbackPath}`;
export const getAuth0LogoutUrl = () => getFrontendOrigin();
export const getAuth0WebOrigin = () => getFrontendOrigin();

export const clearAuthCookies = (res: Response) => {
  res.clearCookie(getTokenCookieName(), getCookieOptions());
  res.clearCookie("gradly_auth0_session", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
  });
  res.clearCookie("gradly_auth_verification", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
  });
};

export const createAuth0Middleware = () => {
  if (!isConfigured()) {
    return null;
  }

  const isProduction = process.env.NODE_ENV === "production";
  const config: ConfigParams = {
    authRequired: false,
    auth0Logout: true,
    errorOnRequiredAuth: true,
    secret: process.env.SECRET,
    baseURL: getBackendBaseUrl(),
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    issuerBaseURL: getIssuerBaseUrl(),
    httpTimeout: getAuth0HttpTimeout(),
    session: {
      name: "gradly_auth0_session",
      cookie: {
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
        secure: isProduction,
      },
    },
    transactionCookie: {
      name: "gradly_auth_verification",
      sameSite: "Lax",
    },
    routes: {
      login: false,
      logout: false,
      callback: callbackPath,
      postLogoutRedirect: getFrontendOrigin(),
    },
    authorizationParams: buildAuthorizationParams(),
    getLoginState: (_req, options) => ({
      returnTo: sanitizeReturnTo(options.returnTo),
    }),
    afterCallback: async (_req, res, session) => {
      try {
        const claims = getProfileClaims(session);
        const email = claims?.email?.toLowerCase();
        const derivedName =
          claims?.name?.trim() ||
          claims?.nickname?.trim() ||
          [claims?.given_name, claims?.family_name].filter(Boolean).join(" ").trim() ||
          email?.split("@")[0];

        if (!email || !derivedName) {
          console.error("Auth0 callback missing required claims", { claims });
          throw new Error("Auth0 did not return the required profile claims");
        }

        const user = await prisma.user.upsert({
          where: { email },
          update: { name: derivedName },
          create: {
            name: derivedName,
            email,
            passwordHash: `auth0:${claims?.sub ?? email}`,
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });

        const token = signToken({
          userId: user.id,
          email: user.email,
          name: user.name,
          authProvider: "auth0",
        });

        res.cookie(getTokenCookieName(), token, getCookieOptions());
        return session;
      } catch (error) {
        console.error("Auth0 afterCallback failed", error);
        throw error;
      }
    },
  };

  return auth(config);
};

export const startAuth0Login = async (req: Request, res: Response) => {
  const provider = typeof req.query.provider === "string" ? req.query.provider : undefined;
  const mode = typeof req.query.mode === "string" ? req.query.mode : undefined;
  clearAuthCookies(res);
  await res.oidc.login({
    returnTo: sanitizeReturnTo(req.query.returnTo),
    authorizationParams: buildAuthorizationParams(provider, mode),
  });
};

export const startAuth0Signup = async (req: Request, res: Response) => {
  const provider = typeof req.query.provider === "string" ? req.query.provider : undefined;
  clearAuthCookies(res);
  await res.oidc.login({
    returnTo: sanitizeReturnTo(req.query.returnTo),
    authorizationParams: buildAuthorizationParams(provider, "signup"),
  });
};

export const startAuth0Logout = async (req: Request, res: Response) => {
  clearAuthCookies(res);
  await res.oidc.logout({
    returnTo: sanitizeReturnTo(req.query.returnTo),
    logoutParams: {
      federated: true,
    },
  });
};
