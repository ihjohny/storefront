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
  /** Backend must set GEOGRAPHY_ENABLED=true. Uses subdivisions/localities + delivery-context API. */
  geography:
    process.env.NEXT_PUBLIC_GEOGRAPHY_ENABLED === "true",
  /** When true, store list comes from delivery-context after area selection (requires geography + multiStore). */
  serviceAreaStoreSelection:
    process.env.NEXT_PUBLIC_MULTI_STORE_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_GEOGRAPHY_ENABLED === "true",
  singleStoreCart: process.env.NEXT_PUBLIC_SINGLE_STORE_CART === "true",
  geoLocationTierFilter: parseGeoLocationTierFilter(
    process.env.NEXT_PUBLIC_GEO_LOCATION_TIER_FILTER,
  ),
  geoListOnlyServedAreas: process.env.NEXT_PUBLIC_GEO_LIST_ONLY_SERVED !== "false",
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
