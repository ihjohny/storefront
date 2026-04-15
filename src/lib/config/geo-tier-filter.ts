import type { Features } from "@/lib/config/features";

const TIER_ORDER = ["standard", "extended", "unserved"] as const;

type Tier = (typeof TIER_ORDER)[number];

function normalizeTier(raw: string | undefined): Tier {
  const t = String(raw || "standard").toLowerCase();
  if (t === "standard" || t === "extended" || t === "unserved") return t;
  return "standard";
}

/**
 * Whether a subdivision/locality tier should appear in storefront dropdowns.
 * Red (unserved) can be hidden so users only pick green/gray service areas.
 */
export function isTierSelectable(
  tier: string | undefined,
  mode: Features["geoLocationTierFilter"],
): boolean {
  const t = normalizeTier(tier);
  if (mode === "all") return true;
  if (mode === "served_only") return t === "standard";
  return t === "standard" || t === "extended";
}

export { TIER_ORDER, type Tier };
