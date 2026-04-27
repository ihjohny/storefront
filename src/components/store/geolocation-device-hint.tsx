"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GEOLOCATION_PREFILL_STORAGE_EVENT,
  readServiceAreaMatchedFromDeviceLocation,
} from "@/lib/geolocation/geocoded-delivery-storage";

/**
 * Muted one-line copy when the delivery area was applied from "Use my location"
 * (the big CTA is hidden; this gives lightweight confirmation).
 */
export function GeolocationDeviceHint() {
  const [show, setShow] = useState(false);

  const refresh = useCallback(() => {
    setShow(readServiceAreaMatchedFromDeviceLocation());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(GEOLOCATION_PREFILL_STORAGE_EVENT, refresh);
    return () => window.removeEventListener(GEOLOCATION_PREFILL_STORAGE_EVENT, refresh);
  }, [refresh]);

  if (!show) return null;

  return (
    <p className="text-[0.7rem] leading-snug text-muted-foreground/90">
      Delivery area was set from your device location. You can still change the fields below.
    </p>
  );
}
