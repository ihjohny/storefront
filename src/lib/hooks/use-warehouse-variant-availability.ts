"use client";

import { useEffect, useState } from "react";
import { getVariantAvailability, type VariantAvailabilityResponse } from "@/lib/api/variant-availability";
import { features } from "@/lib/config/features";
import { useStore } from "@/lib/hooks/use-store";

export type WarehouseAvailabilityPhase = "idle" | "loading" | "ready" | "error";

/** Why Add to cart is blocked when strict warehouse UI is on */
export type WarehouseVariantGateReason = "loading" | "fetch_error" | "unavailable";

/**
 * When {@link features.warehouseAvailabilityUi} is on, loads PDP availability from the backend
 * (`GET /api/storefront/variant-availability`).
 *
 * - Response **`inventoryEnabled: false`** (including backend `INVENTORY_ENABLED=false`, or client treats **`404`**
 *   as no probe): **no** per-SKU blocking — catalog / no-stock-tracking deploys behave normally.
 * - Response **`inventoryEnabled: true`**: lines with **`purchasable: false`** block Add to cart.
 * - Other fetch failures: fail-closed (set `NEXT_PUBLIC_WAREHOUSE_AVAILABILITY_UI=false` if probes are unwanted).
 */
export function useWarehouseVariantAvailability(productId: string) {
  const strictAvail = features.warehouseAvailabilityUi;
  const { commerceStore } = useStore();
  const storeId =
    features.multiStore && commerceStore?.id ? commerceStore.id : undefined;

  const [phase, setPhase] = useState<WarehouseAvailabilityPhase>(() =>
    strictAvail ? "loading" : "idle",
  );
  const [availability, setAvailability] = useState<VariantAvailabilityResponse | null>(null);

  useEffect(() => {
    if (!strictAvail) {
      setPhase("idle");
      setAvailability(null);
      return undefined;
    }

    let cancelled = false;
    setPhase("loading");
    setAvailability(null);

    void getVariantAvailability({
      productId,
      storeLocationId: storeId ?? undefined,
    })
      .then((res) => {
        if (!cancelled) {
          setAvailability(res);
          setPhase("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAvailability(null);
          setPhase("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [strictAvail, productId, storeId]);

  function isVariantPurchasable(variantId: string | undefined): boolean {
    return variantGateReason(variantId) !== "unavailable";
  }

  function variantGateReason(variantId: string | undefined): WarehouseVariantGateReason | null {
    if (!strictAvail) {
      return null;
    }
    if (phase === "idle" || phase === "loading") {
      return "loading";
    }
    if (phase === "error") {
      return "fetch_error";
    }

    if (!availability || !availability.inventoryEnabled) {
      return null;
    }

    let purchasable = true;
    if (!variantId) {
      const row = availability.lines.find((l) => l.variantId === null);
      purchasable = row?.purchasable !== false;
    } else {
      const row = availability.lines.find((l) => l.variantId === variantId);
      purchasable = row?.purchasable !== false;
    }

    return purchasable ? null : "unavailable";
  }

  return { strictAvail, availability, phase, isVariantPurchasable, variantGateReason };
}
