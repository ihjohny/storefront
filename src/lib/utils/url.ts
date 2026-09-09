export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }

  const backendInternalOrigin = process.env.BACKEND_URL
    ? new URL(process.env.BACKEND_URL).origin
    : null;

  // If path is a full URL, handle internal Docker routing and localhost translation
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const url = new URL(path);
      // When running in Docker with BACKEND_URL configured, route media fetches through internal backend origin
      if (backendInternalOrigin && url.pathname.startsWith("/api/media/file/")) {
        return `${backendInternalOrigin}${url.pathname}${url.search}`;
      }
      if (
        (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
        url.port === "3000" &&
        backendInternalOrigin
      ) {
        return `${backendInternalOrigin}${url.pathname}${url.search}`;
      }
      return path;
    } catch {
      return path;
    }
  }

  const backendUrl = (
    backendInternalOrigin ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:3000"
  ).replace(/\/$/, "");

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${backendUrl}${cleanPath}`;
}
