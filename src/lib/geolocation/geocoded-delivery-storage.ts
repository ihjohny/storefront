/**
 * Client-only persistence of the last successful reverse result for checkout prefill.
 * (Consent UX can be layered on later; data stays in-browser.)
 */

import type { GeocodedAddressDetails, ReverseGeocodeSuccess } from "./types";

const STORAGE_KEY = "bs-geocoded-delivery-v1";

/** User dismissed the "Use my location" callout (Not now) or completed a successful match. */
const PREFILL_DISMISSED_KEY = "bs-geolocation-prefill-dismissed";

/**
 * Set when "Use my location" matched a service area; drives a one-line status hint (not "Not now").
 */
const SERVICE_AREA_FROM_DEVICE_KEY = "bs-service-area-from-device-v1";

export function readGeolocationPrefillDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(PREFILL_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeGeolocationPrefillDismissed(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFILL_DISMISSED_KEY, "1");
  } catch {
    /* quota */
  }
}

export function setServiceAreaMatchedFromDeviceLocation(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SERVICE_AREA_FROM_DEVICE_KEY, "1");
  } catch {
    /* quota */
  }
}

export function readServiceAreaMatchedFromDeviceLocation(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SERVICE_AREA_FROM_DEVICE_KEY) === "1";
  } catch {
    return false;
  }
}

/** True when the large prefill CTA should stay hidden. */
export function shouldHideGeolocationPrefillCallout(): boolean {
  return (
    readGeolocationPrefillDismissed() || readServiceAreaMatchedFromDeviceLocation()
  );
}

export function clearGeolocationPrefillDismissed(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFILL_DISMISSED_KEY);
  } catch {
    /* ignore */
  }
}

export function clearServiceAreaMatchedFromDeviceLocation(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SERVICE_AREA_FROM_DEVICE_KEY);
  } catch {
    /* ignore */
  }
}

/** Fired when prefill-related localStorage keys change (same tab). */
export const GEOLOCATION_PREFILL_STORAGE_EVENT = "bs-geolocation-prefill-storage";

export function notifyGeolocationPrefillListeners(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(GEOLOCATION_PREFILL_STORAGE_EVENT));
}

/**
 * Call when the shopper changes country / region / locality manually (not from GPS).
 * Clears the device-location hint and allows the "Use my location" callout to show again.
 */
export function resetGeolocationPrefillAfterManualAreaChange(): void {
  clearServiceAreaMatchedFromDeviceLocation();
  clearGeolocationPrefillDismissed();
  notifyGeolocationPrefillListeners();
}

/** Subset of checkout address fields for merging with the address form default values. */
export type GeocodedAddressFormPartial = {
  label?: string;
  street1?: string;
  street2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

export type GeocodedDeliveryStored = {
  v: 1;
  savedAt: number;
  latitude: number;
  longitude: number;
  result: Pick<
    ReverseGeocodeSuccess,
    | "subdivisionHint"
    | "localityHint"
    | "localityHintCandidates"
    | "displayName"
    | "addressDetails"
  >;
};

function asString(v: unknown): string | null {
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return null;
}

/**
 * Map OSM address details to form fields. Does not set names / guest email.
 */
export function addressDetailsToFormPartial(
  d: GeocodedAddressDetails,
): GeocodedAddressFormPartial {
  const parts = [d.houseNumber, d.road].filter(
    (s): s is string => typeof s === "string" && s.length > 0,
  );
  const street1 = parts.length > 0 ? parts.join(" ") : (d.road ?? "");
  const line2 = [d.neighbourhood, d.suburb].map(asString).filter(Boolean);
  const out: GeocodedAddressFormPartial = {
    label: "Home",
    street2: line2[0] ?? "",
    city: d.city || d.cityDistrict || d.suburb || "",
    postalCode: d.postcode ?? "",
    country: d.countryCode.toUpperCase() || "BD",
  };
  if (street1.trim()) {
    out.street1 = street1.trim();
  }
  return out;
}

export function saveGeocodedDelivery(
  input: { latitude: number; longitude: number; result: ReverseGeocodeSuccess },
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: GeocodedDeliveryStored = {
      v: 1,
      savedAt: Date.now(),
      latitude: input.latitude,
      longitude: input.longitude,
      result: {
        subdivisionHint: input.result.subdivisionHint,
        localityHint: input.result.localityHint,
        localityHintCandidates: input.result.localityHintCandidates,
        displayName: input.result.displayName,
        addressDetails: input.result.addressDetails,
      },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

/**
 * Read stored geocode and return partial address form values (merge with user draft after).
 */
export function readGeocodedAddressFormPartial(): GeocodedAddressFormPartial | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as GeocodedDeliveryStored;
    if (p.v !== 1 || !p.result?.addressDetails) return null;
    return addressDetailsToFormPartial(p.result.addressDetails);
  } catch {
    return null;
  }
}
