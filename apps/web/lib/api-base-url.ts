const localApiBaseUrl = "http://localhost:4000/api/v1";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isProductionBrowserOnRemoteHost() {
  return (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "production" &&
    !isLocalHostname(window.location.hostname)
  );
}

function getConfiguredApiBaseUrl() {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return "";
  }

  return trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL);
}

export function getApiBaseUrl() {
  const configuredApiBaseUrl = getConfiguredApiBaseUrl();
  if (configuredApiBaseUrl) {
    try {
      const hostname = new URL(configuredApiBaseUrl).hostname;
      if (
        process.env.NODE_ENV === "production" &&
        isLocalHostname(hostname) &&
        (typeof window === "undefined" || isProductionBrowserOnRemoteHost())
      ) {
        return "";
      }
    } catch {
      return "";
    }

    return configuredApiBaseUrl;
  }

  if (typeof window !== "undefined" && isLocalHostname(window.location.hostname)) {
    return localApiBaseUrl;
  }

  if (process.env.NODE_ENV === "development") {
    return localApiBaseUrl;
  }

  return "";
}

export function getApiConfigMessage() {
  const configuredApiBaseUrl = getConfiguredApiBaseUrl();
  if (configuredApiBaseUrl) {
    try {
      const hostname = new URL(configuredApiBaseUrl).hostname;
      if (
        process.env.NODE_ENV === "production" &&
        isLocalHostname(hostname) &&
        (typeof window === "undefined" || isProductionBrowserOnRemoteHost())
      ) {
        return "The build environment is using a localhost API URL. Set NEXT_PUBLIC_API_URL to a deployed API base URL for production builds.";
      }
    } catch {
      return "NEXT_PUBLIC_API_URL is invalid. Set it to a full deployed API base URL.";
    }

    return "";
  }

  if (typeof window !== "undefined" && isLocalHostname(window.location.hostname)) {
    return "";
  }

  if (process.env.NODE_ENV === "development") {
    return "";
  }

  return "This deployment is missing NEXT_PUBLIC_API_URL. Set it to the deployed API base URL and redeploy.";
}

export function getApiUnavailableMessage(apiBaseUrl: string) {
  if (apiBaseUrl.includes("localhost:4000")) {
    return `Couldn't reach the local API at ${apiBaseUrl}. Start the API server on localhost:4000 and try again.`;
  }

  return `Couldn't reach the API at ${apiBaseUrl}. Check that the backend is deployed and that NEXT_PUBLIC_API_URL points to it.`;
}
