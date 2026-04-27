/** Browser-only JWT for cross-origin API calls when the HttpOnly cookie is not sent to the backend origin. */
const STORAGE_KEY = "bs-payload-jwt";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, token);
  } catch {
    /* storage full / private mode */
  }
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
