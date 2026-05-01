const localApiUrl = "http://localhost:4000";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const getApiBaseUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  return localApiUrl;
};

export const getApiFallbackUrl = () => localApiUrl;
