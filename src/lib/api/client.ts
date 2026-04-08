type ApiClientOptions = RequestInit & {
  locale?: string;
  guestId?: string;
};

function normalizeApiBase(url: string) {
  return url.replace(/\/$/, "");
}

/**
 * REST collection paths are rooted at `/api` on the Payload backend.
 * - Server: always derive from `BACKEND_URL` + `/api` so Turbopack/RSC never
 *   relies on `NEXT_PUBLIC_*` (which can be unset during SSR), which would
 *   make `fetch` resolve relative URLs against the storefront origin.
 * - Client: prefer `NEXT_PUBLIC_API_URL` for the browser.
 */
function getBaseUrl() {
  const backendOrigin = normalizeApiBase(
    process.env.BACKEND_URL || "http://localhost:3000",
  );
  const serverApiBase = `${backendOrigin}/api`;

  if (typeof window === "undefined") {
    return serverApiBase;
  }

  const publicApi = process.env.NEXT_PUBLIC_API_URL
    ? normalizeApiBase(process.env.NEXT_PUBLIC_API_URL)
    : null;
  return publicApi ?? serverApiBase;
}

function toApiUrl(endpoint: string) {
  const baseUrl = getBaseUrl();

  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  if (endpoint.startsWith("/api/")) {
    return `${baseUrl.replace(/\/api$/, "")}${endpoint}`;
  }

  if (endpoint.startsWith("/")) {
    return `${baseUrl}${endpoint}`;
  }

  return `${baseUrl}/${endpoint}`;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { locale, guestId, headers, ...fetchOptions } = options;

  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type") && fetchOptions.body) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (locale) {
    requestHeaders.set("Accept-Language", locale);
  }

  if (guestId) {
    requestHeaders.set("X-Guest-Id", guestId);
  }

  const response = await fetch(toApiUrl(endpoint), {
    ...fetchOptions,
    headers: requestHeaders,
    credentials: "include",
  });

  const rawBody = await response.text();
  let parsedBody: unknown = null;

  if (rawBody) {
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      parsedBody = rawBody;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      `API request failed (${response.status})`,
      response.status,
      parsedBody,
    );
  }

  return parsedBody as T;
}
