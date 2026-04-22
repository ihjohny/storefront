"use client";

import { useCallback, useEffect, useState } from "react";
import { features } from "@/lib/config/features";
import { useStore } from "@/lib/hooks/use-store";
import {
  GEOLOCATION_PREFILL_STORAGE_EVENT,
  notifyGeolocationPrefillListeners,
  saveGeocodedDelivery,
  setServiceAreaMatchedFromDeviceLocation,
  shouldHideGeolocationPrefillCallout,
  writeGeolocationPrefillDismissed,
} from "@/lib/geolocation/geocoded-delivery-storage";
import type { ReverseGeocodeResult } from "@/lib/geolocation/types";

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 20_000,
      maximumAge: 120_000,
    });
  });
}

export function GeolocationPrefillButton() {
  const { isLoading, serviceArea, applyGeolocationHints } = useStore();
  const [uiReady, setUiReady] = useState(false);
  /** null = not yet read localStorage (avoids flash of the CTA when already dismissed). */
  const [calloutSuppressed, setCalloutSuppressed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncCallout = useCallback(() => {
    setCalloutSuppressed(shouldHideGeolocationPrefillCallout());
  }, []);

  useEffect(() => {
    syncCallout();
    setUiReady(true);
  }, [syncCallout]);

  useEffect(() => {
    const onUpdate = () => syncCallout();
    window.addEventListener(GEOLOCATION_PREFILL_STORAGE_EVENT, onUpdate);
    return () => window.removeEventListener(GEOLOCATION_PREFILL_STORAGE_EVENT, onUpdate);
  }, [syncCallout]);

  const onDismiss = useCallback(() => {
    writeGeolocationPrefillDismissed();
    setCalloutSuppressed(true);
    notifyGeolocationPrefillListeners();
  }, []);

  const onUseLocation = useCallback(async () => {
    if (!applyGeolocationHints) return;
    setError(null);
    setBusy(true);
    try {
      const pos = await getCurrentPosition();
      const { latitude, longitude } = pos.coords;
      const res = await fetch("/api/geolocation/reverse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });
      const data = (await res.json()) as ReverseGeocodeResult;

      if (!data.ok) {
        if (data.code === "OUT_OF_COUNTRY" || data.code === "OUTSIDE_BOUNDS") {
          setError("We could not use this location for the current service area. Please choose your country and region below.");
        } else {
          setError(data.message || "Could not detect your area. Try manual selection.");
        }
        return;
      }

      saveGeocodedDelivery({
        latitude,
        longitude,
        result: data,
      });

      const applied = await applyGeolocationHints({
        subdivisionHint: data.subdivisionHint,
        localityHint: data.localityHint,
        localityHintCandidates: data.localityHintCandidates,
      });

      if (!applied.applied) {
        setError(
          applied.reason === "no_subdivision"
            ? "Could not match your area to our regions. Pick manually."
            : "Could not apply location. Try manual selection.",
        );
        return;
      }

      setServiceAreaMatchedFromDeviceLocation();
      writeGeolocationPrefillDismissed();
      setCalloutSuppressed(true);
      notifyGeolocationPrefillListeners();
    } catch (e: unknown) {
      let msg = "Something went wrong.";
      if (
        e &&
        typeof e === "object" &&
        "code" in e &&
        typeof (e as GeolocationPositionError).code === "number"
      ) {
        const geo = e as GeolocationPositionError;
        msg =
          geo.code === 1
            ? "Location permission denied."
            : "Could not read your location.";
      } else if (e instanceof Error) {
        msg = e.message;
      }
      setError(msg);
    } finally {
      setBusy(false);
    }
  }, [applyGeolocationHints]);

  if (
    !uiReady ||
    !features.geolocationPrefill ||
    !features.serviceAreaStoreSelection ||
    isLoading ||
    !serviceArea ||
    !applyGeolocationHints
  ) {
    return null;
  }

  if (calloutSuppressed) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-dashed border-border/80 bg-muted/30 px-3 py-2 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
      <span className="font-medium text-foreground">Delivery area</span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onUseLocation()}
          className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
        >
          {busy ? "Locating…" : "Use my location"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onDismiss}
          className="rounded-md px-2.5 py-1 text-xs text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
        >
          Not now
        </button>
      </div>
      {error ? <p className="w-full text-destructive sm:mt-0">{error}</p> : null}
    </div>
  );
}
