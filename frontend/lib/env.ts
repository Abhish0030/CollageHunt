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
  if (typeof window !== "undefined") {
    return "";
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
