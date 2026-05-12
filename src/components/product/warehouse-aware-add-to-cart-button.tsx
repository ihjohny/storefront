"use client";

import type { ComponentProps } from "react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { features } from "@/lib/config/features";
import { useWarehouseVariantAvailability } from "@/lib/hooks/use-warehouse-variant-availability";

const DEFAULT_CHECKING = "Checking availability…";
const DEFAULT_FETCH_ERROR = "Couldn't verify stock availability. Try again.";

type WarehouseAwareAddToCartButtonProps = Omit<
  ComponentProps<typeof AddToCartButton>,
  "addBlockedReason"
> & {
  outOfStockLabel: string;
  /** Shown while the variant-availability request is in flight */
  checkingAvailabilityLabel?: string;
  /** Shown when the availability request fails (network / 404 / etc.) */
  availabilityCheckFailedLabel?: string;
};

export function WarehouseAwareAddToCartButton({
  productId,
  variantId,
  outOfStockLabel,
  checkingAvailabilityLabel = DEFAULT_CHECKING,
  availabilityCheckFailedLabel = DEFAULT_FETCH_ERROR,
  ...rest
}: WarehouseAwareAddToCartButtonProps) {
  const { variantGateReason } = useWarehouseVariantAvailability(productId);

  let addBlockedReason: string | null = null;
  if (features.warehouseAvailabilityUi) {
    const gate = variantGateReason(variantId);
    if (gate === "loading") {
      addBlockedReason = checkingAvailabilityLabel;
    } else if (gate === "fetch_error") {
      addBlockedReason = availabilityCheckFailedLabel;
    } else if (gate === "unavailable") {
      addBlockedReason = outOfStockLabel;
    }
  }

  return (
    <AddToCartButton
      productId={productId}
      variantId={variantId}
      {...rest}
      addBlockedReason={addBlockedReason}
    />
  );
}
