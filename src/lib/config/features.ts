function parseGeoLocationTierFilter(
  raw: string | undefined,
): "served_only" | "served_and_extended" | "all" {
  const v = (raw || "served_and_extended").toLowerCase().trim();
  if (v === "all" || v === "none" || v === "off") return "all";
  if (v === "served_only" || v === "standard_only" || v === "green_only")
    return "served_only";
  return "served_and_extended";
}

export const features = {
  multivendor: process.env.NEXT_PUBLIC_MULTIVENDOR_ENABLED === "true",
  guestCheckout: process.env.NEXT_PUBLIC_GUEST_CHECKOUT_ENABLED !== "false",
  socialLogin: process.env.NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED !== "false",
  reviews: process.env.NEXT_PUBLIC_REVIEWS_ENABLED !== "false",
  multiStore: process.env.NEXT_PUBLIC_MULTI_STORE_ENABLED === "true",
  geography: process.env.NEXT_PUBLIC_GEOGRAPHY_ENABLED === "true",
  serviceAreaStoreSelection:
    process.env.NEXT_PUBLIC_MULTI_STORE_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_GEOGRAPHY_ENABLED === "true",
  singleStoreCart: process.env.NEXT_PUBLIC_SINGLE_STORE_CART === "true",
  /**
   * Region/locality dropdowns: which service tiers are listed.
   * - served_only — standard (green) only
   * - served_and_extended — standard + extended (green + gray); hides unserved (red)
   * - all — no filtering (admin/debug)
   */
  geoLocationTierFilter: parseGeoLocationTierFilter(
    process.env.NEXT_PUBLIC_GEO_LOCATION_TIER_FILTER,
  ),
  /**
   * When true (default), region/locality API lists only areas served by at least one active public
   * stock location. Set to "false" to show all active geography (e.g. admin preview).
   */
  geoListOnlyServedAreas: process.env.NEXT_PUBLIC_GEO_LIST_ONLY_SERVED !== "false",
  /**
   * When true, first visit (no saved service area) auto-picks first country, Dhaka/Chattogram-style
   * default subdivision, and a store — legacy demo behavior.
   * When false (default), user must select country + region, or use “Use my location”, before
   * any store is bound for checkout.
   */
  autoSelectDefaultServiceArea:
    process.env.NEXT_PUBLIC_AUTO_SELECT_DEFAULT_SERVICE_AREA === "true",
  /** “Use my location” + reverse geocode for service area prefill (geocoder is configured per deploy). */
  geolocationPrefill: process.env.NEXT_PUBLIC_GEOLOCATION_PREFILL === "true",
  i18n: {
    locales: (process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || "en,bn")
      .split(",")
      .map((locale) => locale.trim())
      .filter(Boolean),
    defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en",
  },
  currency: {
    supported: (process.env.NEXT_PUBLIC_SUPPORTED_CURRENCIES || "USD,BDT")
      .split(",")
      .map((currency) => currency.trim())
      .filter(Boolean),
    default: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "USD",
  },
} as const;

export type Features = typeof features;
