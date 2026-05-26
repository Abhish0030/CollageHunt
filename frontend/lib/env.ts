const localApiUrl = "http://localhost:4000";
const localAppUrl = "http://localhost:3000";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const getBackendApiBaseUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  return localApiUrl;
};

export const getApiBaseUrl = () => {
  const backendUrl = getBackendApiBaseUrl();

  if (typeof window !== "undefined") {
    return backendUrl;
  }

  const vercelUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (!vercelUrl) {
    return localAppUrl;
  }

  const normalizedUrl = /^https?:\/\//.test(vercelUrl) ? vercelUrl : `https://${vercelUrl}`;
  return trimTrailingSlash(normalizedUrl);
};

export const getApiFallbackUrl = () => getBackendApiBaseUrl();

export const getAuthCookieNames = () => [
  "collagehunt_token",
  "collagehunt_auth0_session",
  "collagehunt_auth_verification",
] as const;
