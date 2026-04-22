/**
 * In-process cache for Nominatim reverse results to respect
 * https://operations.osmfoundation.org/policies/nominatim/ (minimize repeat requests).
 * Not durable across server restarts; use rounded coordinates as keys.
 */
const cacheTtlMs = (() => {
  const s = process.env.GEOCODER_CACHE_TTL_SEC;
  if (s && /^\d+$/.test(s)) return Math.min(86400 * 30, Math.max(60, parseInt(s, 10))) * 1000;
  return 7 * 24 * 60 * 60 * 1000; // 7 days
})();

const maxEntries = 300;

const store = new Map<string, { expires: number; payload: string }>();

function roundCoord(n: number, decimals: number): string {
  const f = 10 ** decimals;
  return String(Math.round(n * f) / f);
}

/** ~11 m precision — groups nearby “Use my location” clicks */
export function reverseGeocodeCacheKey(lat: number, lon: number): string {
  return `${roundCoord(lat, 4)}|${roundCoord(lon, 4)}`;
}

export function getCachedReverseJson(key: string): string | null {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() > e.expires) {
    store.delete(key);
    return null;
  }
  return e.payload;
}

export function setCachedReverseJson(key: string, json: string): void {
  if (store.size >= maxEntries) {
    const first = store.keys().next().value;
    if (first) store.delete(first);
  }
  store.set(key, { expires: Date.now() + cacheTtlMs, payload: json });
}
