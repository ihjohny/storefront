export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }

  // If path is a full URL, handle localhost:3000 / 127.0.0.1:3000 translation in container
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const url = new URL(path);
      // When running in Docker, localhost:3000 from the backend database needs to map to BACKEND_URL
      if (
        (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
        url.port === "3000" &&
        process.env.BACKEND_URL
      ) {
        const backendOrigin = new URL(process.env.BACKEND_URL).origin;
        return `${backendOrigin}${url.pathname}${url.search}`;
      }
      return path;
    } catch {
      return path;
    }
  }

  const backendUrl = (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:3000"
  ).replace(/\/$/, "");

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${backendUrl}${cleanPath}`;
}
