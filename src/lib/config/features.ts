import { parseAuthRequiredIdentifier } from "@/lib/auth/auth-required-identifier";

function parseGeoLocationTierFilter(
  raw: string | undefined,
): "served_only" | "served_and_extended" | "all" {
  const v = (raw || "served_and_extended").toLowerCase().trim();
  if (v === "all" || v === "none" || v === "off") return "all";
  if (v === "served_only" || v === "standard_only" || v === "green_only")
    return "served_only";
  return "served_and_extended";
}

function parsePdpGalleryMobileArrows(raw: string | undefined): boolean {
  const v = (raw ?? "").toLowerCase().trim();
  if (v === "") return true;
  if (
    v === "false" ||
    v === "0" ||
    v === "no" ||
    v === "off" ||
    v === "hidden" ||
    v === "hide"
  ) {
    return false;
  }
  return true;
}

function parsePdpDescriptionDefaultOpen(raw: string | undefined): boolean {
  const v = (raw ?? "").toLowerCase().trim();
  if (v === "") return false;
  return (
    v === "true" ||
    v === "1" ||
    v === "yes" ||
    v === "on" ||
    v === "open" ||
    v === "expanded"
  );
}

function parseQuickViewEnabled(raw: string | undefined): boolean {
  const v = (raw ?? "").toLowerCase().trim();
  if (v === "false" || v === "0" || v === "no" || v === "off" || v === "hidden" || v === "hide") {
    return false;
  }
  return true;
}

function parseListingProductCardClick(raw: string | undefined): "pdp" | "quickview" {
  const v = (raw ?? "").toLowerCase().trim();
  if (v === "quickview" || v === "quick_view" || v === "modal") {
    return "quickview";
  }
  return "pdp";
}

function parseWarehouseAvailabilityUi(raw: string | undefined): boolean {
  const v = (raw ?? "").toLowerCase().trim();
  if (
    v === "false" ||
    v === "0" ||
    v === "no" ||
    v === "off" ||
    v === "hidden" ||
    v === "hide"
  ) {
    return false;
  }
  // Default on when unset — avoids PDP allowing Add to cart when cart hooks reject the line.
  return true;
}

export const features = {
  /**
   * PDP / Quick View: fetch `/api/storefront/variant-availability` and disable Add to cart when the
   * backend cannot allocate the line. Default **on**; set `NEXT_PUBLIC_WAREHOUSE_AVAILABILITY_UI=false` to disable.
   * Harmless when backend returns **`inventoryEnabled: false`** (`INVENTORY_ENABLED=false`) or **`404`** (probe disabled).
   */
  warehouseAvailabilityUi: parseWarehouseAvailabilityUi(
    process.env.NEXT_PUBLIC_WAREHOUSE_AVAILABILITY_UI,
  ),
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
  /**
   * When `true`, product cards on stock-filtered PLPs show a small “available here” hint (**Q6**).
   * Off unless explicitly enabled (`NEXT_PUBLIC_PRODUCT_CARD_STOCK_BADGES_ON_CARDS=true`).
   */
  productCardStockBadgesOnCards:
    process.env.NEXT_PUBLIC_PRODUCT_CARD_STOCK_BADGES_ON_CARDS === "true",
  /**
   * When > 0, cart page shows an optional countdown banner (minutes from first non-empty cart this session).
   * Set via `NEXT_PUBLIC_CART_URGENCY_COUNTDOWN_MINUTES` (omit or 0 to disable).
   */
  cartUrgencyCountdownMinutes: (() => {
    const raw = process.env.NEXT_PUBLIC_CART_URGENCY_COUNTDOWN_MINUTES;
    if (raw === undefined || raw === "") return 0;
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.min(Math.floor(n), 24 * 60);
  })(),
  /**
   * When not `"false"`, checkout sends `simulatePayment: true` when the backend allows it (dev/admin).
   * Set to `false` to request the hosted payment flow when the backend has SSL Commerz session enabled.
   */
  checkoutSimulatePayment: process.env.NEXT_PUBLIC_CHECKOUT_SIMULATE_PAYMENT !== "false",
  /**
   * Guest checkout + registration parity with backend AUTH_REQUIRED_IDENTIFIER.
   * Set NEXT_PUBLIC_AUTH_REQUIRED_IDENTIFIER to email | phone | either (default either).
   */
  authRequiredIdentifier: parseAuthRequiredIdentifier(
    process.env.NEXT_PUBLIC_AUTH_REQUIRED_IDENTIFIER,
  ),
  /**
   * PDP gallery: show outlined prev/next + counter on **mobile** (`md:hidden` strip).
   * Set `NEXT_PUBLIC_PDP_GALLERY_MOBILE_ARROWS=false`, `hidden`, `hide`, or `0` to disable (swipe + thumbnails only).
   * Default: **shown** when unset.
   */
  pdpGalleryMobileArrows: parsePdpGalleryMobileArrows(
    process.env.NEXT_PUBLIC_PDP_GALLERY_MOBILE_ARROWS,
  ),
  /**
   * PDP collapsible **product description**: expanded on first paint when truthy.
   * Set `NEXT_PUBLIC_PDP_DESCRIPTION_DEFAULT_OPEN=true` | `open` | `1` | `expanded` | `yes`.
   * Default: **collapsed** when unset.
   */
  pdpDescriptionDefaultOpen: parsePdpDescriptionDefaultOpen(
    process.env.NEXT_PUBLIC_PDP_DESCRIPTION_DEFAULT_OPEN,
  ),
  /**
   * PLP / listing Quick View modal (`NEXT_PUBLIC_QUICK_VIEW_ENABLED`).
   * Default **on** when unset; set to `false` | `0` | `off` | `hidden` to disable.
   */
  quickViewEnabled: parseQuickViewEnabled(process.env.NEXT_PUBLIC_QUICK_VIEW_ENABLED),
  /**
   * Product comparison (`NEXT_PUBLIC_PRODUCT_COMPARE_ENABLED`) — listing + PDP + `/compare`.
   * Default **on** when unset; set to `false` | `0` | `off` | `hidden` to disable.
   */
  productCompareEnabled: parseQuickViewEnabled(process.env.NEXT_PUBLIC_PRODUCT_COMPARE_ENABLED),
  /**
   * Listing card image/title click when Quick View is enabled (`NEXT_PUBLIC_LISTING_PRODUCT_CARD_CLICK`).
   * - `pdp` (default) — navigate to the product page (eye icon still opens Quick View).
   * - `quickview` | `quick_view` | `modal` — open Quick View from the image/title tap area.
   */
  listingProductCardClick: parseListingProductCardClick(
    process.env.NEXT_PUBLIC_LISTING_PRODUCT_CARD_CLICK,
  ),
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
