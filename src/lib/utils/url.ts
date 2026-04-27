export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }

  if (path.startsWith("http")) {
    return path;
  }

  const backendUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "http://localhost:3000";

  return `${backendUrl}${path}`;
}
