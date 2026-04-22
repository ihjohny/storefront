/**
 * Public Nominatim reverse geocoding (no self-hosting).
 * Usage policy: https://operations.osmfoundation.org/policies/nominatim/
 * Set GEOCODER_USER_AGENT to identify your app (required by the policy).
 *
 * Reverse API: `format=jsonv2`, `addressdetails=1`, and `zoom` (not the Search API `layer` param;
 * the policy still requires client/server caching; see /api route + nominatim-cache).
 */

import type { GeocoderProvider, GeocodedAddressDetails, ReverseGeocodeInput, ReverseGeocodeResult } from "../types";

const DEFAULT_BASE = "https://nominatim.openstreetmap.org";

type NominatimAddress = {
  country_code?: string;
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city_district?: string;
  state_district?: string;
  state?: string;
  county?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  residential?: string;
  municipal_district?: string;
  postcode?: string;
  [key: string]: unknown;
};

function str(addr: NominatimAddress, k: string): string | null {
  const v = addr[k];
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return null;
}

function buildAddressDetails(a: NominatimAddress, countryCode: string): GeocodedAddressDetails {
  return {
    houseNumber: str(a, "house_number"),
    road: str(a, "road"),
    neighbourhood: str(a, "neighbourhood"),
    suburb: str(a, "suburb"),
    city: str(a, "city") || str(a, "town") || str(a, "village") || str(a, "hamlet"),
    cityDistrict: str(a, "city_district") || str(a, "municipal_district") || str(a, "state_district"),
    county: str(a, "county"),
    state: str(a, "state"),
    postcode: str(a, "postcode"),
    countryCode,
  };
}

/**
 * OSM can spread place names; try in order to match our CMS localities.
 */
function localityHintCandidatesList(addr: NominatimAddress): string[] {
  const keys = [
    "city",
    "town",
    "village",
    "municipal_district",
    "city_district",
    "suburb",
    "neighbourhood",
    "hamlet",
    "county",
  ] as const;
  const out: string[] = [];
  for (const k of keys) {
    const t = str(addr, k);
    if (t && !out.includes(t)) {
      out.push(t);
    }
  }
  return out;
}

function pickSubdivisionHint(addr: NominatimAddress): string {
  const state = str(addr, "state");
  const county = str(addr, "county");
  if (state && county) {
    if (state.includes(county) || county.includes(state)) {
      return state;
    }
    return `${state} ${county}`.trim();
  }
  return state || county || "";
}

export function createNominatimGeocoder(): GeocoderProvider {
  const base = (process.env.NOMINATIM_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");
  const userAgent =
    process.env.GEOCODER_USER_AGENT?.trim() || "BSCommerceStorefront/1.0 (+https://github.com/)";

  return {
    async reverse(input: ReverseGeocodeInput): Promise<ReverseGeocodeResult> {
      const { latitude, longitude } = input;
      const url = new URL(`${base}/reverse`);
      url.searchParams.set("lat", String(latitude));
      url.searchParams.set("lon", String(longitude));
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("zoom", "18");
      // Prefer English `address` fields so hints match Payload geo names (usually Latin script).
      const acceptLanguage = process.env.GEOCODER_ACCEPT_LANGUAGE?.trim() || "en,en-US";
      url.searchParams.set("accept-language", acceptLanguage);

      try {
        const res = await fetch(url.toString(), {
          headers: {
            Accept: "application/json",
            "User-Agent": userAgent,
            "Accept-Language": acceptLanguage,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          return {
            ok: false,
            code: "GEOCODER_ERROR",
            message: `Nominatim returned ${res.status}`,
          };
        }

        const data = (await res.json()) as {
          display_name?: string;
          address?: NominatimAddress;
        };

        const addr = data.address;
        if (!addr) {
          return { ok: false, code: "GEOCODER_ERROR", message: "Missing address in response" };
        }

        const cc = typeof addr.country_code === "string" ? addr.country_code.toLowerCase() : "";
        if (cc !== "bd") {
          return {
            ok: false,
            code: "OUT_OF_COUNTRY",
            message: "This location is outside the supported service country",
          };
        }

        const localityHintCandidates = localityHintCandidatesList(addr);
        const subdivisionHint = pickSubdivisionHint(addr);
        const localityHint = localityHintCandidates[0] ?? "";
        const displayName =
          typeof data.display_name === "string" ? data.display_name : subdivisionHint || localityHint;
        const addressDetails = buildAddressDetails(addr, cc);

        return {
          ok: true,
          countryCode: cc,
          subdivisionHint,
          localityHint,
          localityHintCandidates: localityHintCandidates.length > 0 ? localityHintCandidates : [localityHint].filter((s) => s.length > 0),
          displayName,
          addressDetails,
        };
      } catch (e) {
        const message = e instanceof Error ? e.message : "Reverse geocode failed";
        return { ok: false, code: "GEOCODER_ERROR", message };
      }
    },
  };
}
