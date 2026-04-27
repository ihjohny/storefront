/**
 * POST /api/geolocation/reverse
 * Body: { latitude: number, longitude: number }
 *
 * Uses public Nominatim (see https://operations.osmfoundation.org/policies/nominatim/).
 * Set GEOCODER_USER_AGENT in env for a stable app identifier.
 *
 * Env:
 * - GEOCODER_USER_AGENT (recommended)
 * - GEOCODER_PROVIDER (default: nominatim)
 * - NOMINATIM_BASE_URL (optional override)
 * - GEOCODER_CACHE_TTL_SEC (optional, in-memory cache TTL for reverse results; default 7 days)
 */

import { NextResponse } from "next/server";
import { getGeocoder } from "@/lib/geolocation/registry";
import {
  getCachedReverseJson,
  reverseGeocodeCacheKey,
  setCachedReverseJson,
} from "@/lib/geolocation/nominatim-cache";
import type { ReverseGeocodeResult } from "@/lib/geolocation/types";

/** Approximate in-region bounds for the current geocoder policy — skip remote coords early. */
function isRoughlyInBangladesh(lat: number, lon: number): boolean {
  return lat >= 20.5 && lat <= 26.8 && lon >= 88.0 && lon <= 92.8;
}

function parseBody(body: unknown): { latitude: number; longitude: number } | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const lat = o.latitude;
  const lon = o.longitude;
  if (typeof lat !== "number" || typeof lon !== "number") return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { latitude: lat, longitude: lon };
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "INVALID_INPUT", message: "Invalid JSON" } satisfies ReverseGeocodeResult,
      { status: 400 },
    );
  }

  const parsed = parseBody(json);
  if (!parsed) {
    return NextResponse.json(
      { ok: false, code: "INVALID_INPUT", message: "Expected { latitude, longitude } numbers" } satisfies ReverseGeocodeResult,
      { status: 400 },
    );
  }

  const { latitude, longitude } = parsed;

  if (!isRoughlyInBangladesh(latitude, longitude)) {
    return NextResponse.json(
      {
        ok: false,
        code: "OUTSIDE_BOUNDS",
        message: "Coordinates are outside the supported service area",
      } satisfies ReverseGeocodeResult,
      { status: 422 },
    );
  }

  const cacheKey = reverseGeocodeCacheKey(latitude, longitude);
  const cached = getCachedReverseJson(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as ReverseGeocodeResult;
      if (parsed?.ok) {
        return NextResponse.json(parsed);
      }
    } catch {
      /* miss */
    }
  }

  const geocoder = getGeocoder();
  const result = await geocoder.reverse({ latitude, longitude });

  if (!result.ok) {
    const status =
      result.code === "OUT_OF_COUNTRY"
        ? 422
        : result.code === "INVALID_INPUT"
          ? 400
          : 502;
    return NextResponse.json(result, { status });
  }

  setCachedReverseJson(cacheKey, JSON.stringify(result));
  return NextResponse.json(result);
}
