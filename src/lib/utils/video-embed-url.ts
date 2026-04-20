/**
 * Turns a pasted YouTube/Vimeo URL into an iframe-safe embed origin.
 * Returns null if the URL is not a supported pattern (caller may render a plain link).
 */
export function toVideoEmbedSrc(url: string): string | null {
  const raw = url.trim();
  if (!raw) {
    return null;
  }

  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    const host = u.hostname.toLowerCase();

    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").slice(0, 11);
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    if (host.endsWith("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return `https://www.youtube.com/embed/${v}`;
      }
      const embed = u.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embed) {
        return `https://www.youtube.com/embed/${embed[1]}`;
      }
    }

    if (host.endsWith("vimeo.com")) {
      const m = u.pathname.match(/\/(?:video\/)?(\d+)/);
      if (m) {
        return `https://player.vimeo.com/video/${m[1]}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}
