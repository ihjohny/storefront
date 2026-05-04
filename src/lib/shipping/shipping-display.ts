import type { ShippingMethod } from "@/lib/api/shipping";

/** Labels for pricing type + fulfillment hints + order constraints (en/bn via dictionary). */
export type ShippingMethodDictionary = {
  typeFlat: string;
  typePerItem: string;
  typeWeight: string;
  hintPickup: string;
  hintCod: string;
  hintCourier: string;
  minOrder: string;
  maxOrder: string;
};

export type FulfillmentHint = "pickup" | "cod" | "courier";

export function pricingTypeLabel(method: ShippingMethod, d: ShippingMethodDictionary): string {
  switch (method.type) {
    case "flat":
      return d.typeFlat;
    case "per-item":
      return d.typePerItem;
    case "weight-based":
      return d.typeWeight;
    default:
      return d.typeFlat;
  }
}

/**
 * Infer fulfillment UX: COD from Payload flag; pickup/courier hints still from name until dedicated fields exist.
 */
export function inferFulfillmentHint(method: ShippingMethod): FulfillmentHint | null {
  if (method.collectPaymentOnDelivery) {
    return "cod";
  }
  const n = method.name.toLowerCase();
  if (/\b(pickup|pick-up|takeaway|take-away|collect at|click\s*&\s*collect)\b/.test(n)) {
    return "pickup";
  }
  if (/\b(courier|doorstep|home\s*delivery|parcel)\b/.test(n)) {
    return "courier";
  }
  return null;
}

export function fulfillmentHintLabel(hint: FulfillmentHint, d: ShippingMethodDictionary): string {
  switch (hint) {
    case "pickup":
      return d.hintPickup;
    case "cod":
      return d.hintCod;
    case "courier":
      return d.hintCourier;
  }
}

export function formatShippingOrderConstraints(
  method: ShippingMethod,
  d: ShippingMethodDictionary,
  formatPrice: (amount: number, currency: string) => string,
): string | null {
  const parts: string[] = [];
  if (method.minOrderValue != null && method.minOrderValue > 0) {
    parts.push(d.minOrder.replace("{{amount}}", formatPrice(method.minOrderValue, method.currency)));
  }
  if (method.maxOrderValue != null && method.maxOrderValue > 0) {
    parts.push(d.maxOrder.replace("{{amount}}", formatPrice(method.maxOrderValue, method.currency)));
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** True when every selected method has collect-on-delivery enabled (aligned with backend validation). */
export function shippingSelectionsAreAllCod(
  methods: ShippingMethod[],
  selectedIds: string[],
): boolean {
  if (selectedIds.length === 0) return false;
  for (const id of selectedIds) {
    const m = methods.find((x) => x.id === id);
    if (!m || m.collectPaymentOnDelivery !== true) return false;
  }
  return true;
}
