/** Shared checks for specs that need a running Payload API. */

export const apiOrigin = process.env.PLAYWRIGHT_API_ORIGIN || "http://localhost:3000";

export async function isBackendReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${apiOrigin}/api/categories?limit=1`, {
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
