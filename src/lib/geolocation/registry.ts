import type { GeocoderProvider } from "./types";
import { createNominatimGeocoder } from "./providers/nominatim";

/**
 * GEOCODER_PROVIDER: `nominatim` (default) — add more providers alongside createXxxGeocoder.
 */
export function getGeocoder(): GeocoderProvider {
  const id = (process.env.GEOCODER_PROVIDER || "nominatim").toLowerCase().trim();
  if (id === "nominatim") {
    return createNominatimGeocoder();
  }
  return createNominatimGeocoder();
}
