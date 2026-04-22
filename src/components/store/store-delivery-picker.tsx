"use client";

import { useStore } from "@/lib/hooks/use-store";
import { DeliveryPolicyPopover } from "@/components/store/delivery-policy-popover";
import { GeolocationDeviceHint } from "@/components/store/geolocation-device-hint";
import { GeolocationPrefillButton } from "@/components/store/geolocation-prefill-button";
import { resetGeolocationPrefillAfterManualAreaChange } from "@/lib/geolocation/geocoded-delivery-storage";

export type StoreDeliveryPickerProps = {
  idPrefix?: string;
  layout: "compact" | "spacious";
  onCountryChange: (countryId: string) => void;
  onSubdivisionChange: (subdivisionId: string) => void;
  onLocalityChange: (localityId: string | null) => void;
  onStorePick: (storeId: string) => void;
};

/** Fixed height so all controls (including outlet) align on one row where space allows. */
const geoSelectClass =
  "box-border h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-background py-0 pl-3 pr-9 text-xs leading-none text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50";

function areaGridClass(showLocalityField: boolean, showStoreField: boolean): string {
  const n = 2 + (showLocalityField ? 1 : 0) + (showStoreField ? 1 : 0);
  const base = "grid min-w-0 flex-1 grid-cols-1 gap-2";
  if (n <= 2) return `${base} min-[400px]:grid-cols-2`;
  if (n === 3) return `${base} min-[400px]:grid-cols-2 xl:grid-cols-3`;
  return `${base} min-[400px]:grid-cols-2 min-[1100px]:grid-cols-4`;
}

export function StoreDeliveryPicker({
  idPrefix = "bs-geo",
  layout,
  onCountryChange,
  onSubdivisionChange,
  onLocalityChange,
  onStorePick,
}: StoreDeliveryPickerProps) {
  const { stores, selectedStore, serviceArea } = useStore();
  const policy = serviceArea?.deliveryPolicy;

  const countryFieldId = `${idPrefix}-country`;
  const subFieldId = `${idPrefix}-sub`;
  const locFieldId = `${idPrefix}-loc`;
  const storeFieldId = `${idPrefix}-store`;

  /** CMS may have 0 rows for a region; we still show the control so the step is never “missing”. */
  const hasLocalityOptions = Boolean(serviceArea && serviceArea.localities.length > 0);
  const showLocalityField = Boolean(serviceArea?.selectedSubdivisionId);
  const showStoreField = stores.length > 0;
  const multipleOutlets = stores.length > 1;

  return (
    <div className="flex w-full max-w-full flex-col gap-3">
      <div className="flex min-w-0 w-full flex-1 flex-col gap-2">
        {/*
          Use a fragment (not an empty div) so when prefill+hint are null after "Not now",
          there is no phantom flex child — avoids gap-2 above the geo row.
        */}
        {layout === "spacious" ? (
          <>
            <GeolocationPrefillButton />
            <GeolocationDeviceHint />
          </>
        ) : null}
        {serviceArea && (
          <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <div
              className={areaGridClass(showLocalityField, showStoreField)}
            >
              <label className="sr-only" htmlFor={countryFieldId}>
                Country
              </label>
              <select
                id={countryFieldId}
                className={geoSelectClass}
                value={serviceArea.selectedCountryId ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) return;
                  if (v === (serviceArea.selectedCountryId ?? "")) return;
                  onCountryChange(v);
                  resetGeolocationPrefillAfterManualAreaChange();
                }}
              >
                {serviceArea.selectedCountryId == null && (
                  <option value="" disabled>
                    Select country
                  </option>
                )}
                {serviceArea.countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor={subFieldId}>
                Region
              </label>
              <select
                id={subFieldId}
                className={geoSelectClass}
                value={serviceArea.selectedSubdivisionId ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) return;
                  if (v === (serviceArea.selectedSubdivisionId ?? "")) return;
                  onSubdivisionChange(v);
                  resetGeolocationPrefillAfterManualAreaChange();
                }}
                disabled={!serviceArea.selectedCountryId}
              >
                {serviceArea.selectedSubdivisionId == null &&
                  serviceArea.subdivisions.length > 0 && (
                    <option value="" disabled>
                      {serviceArea.selectedCountryId ? "Select region" : "Select country first"}
                    </option>
                  )}
                {serviceArea.subdivisions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {showLocalityField && (
                <>
                  <label className="sr-only" htmlFor={locFieldId}>
                    Local area (optional)
                  </label>
                  <select
                    id={locFieldId}
                    className={geoSelectClass}
                    value={serviceArea.selectedLocalityId ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      const next = v === "" ? null : v;
                      const cur = serviceArea.selectedLocalityId ?? null;
                      if (next === cur) return;
                      onLocalityChange(next);
                      resetGeolocationPrefillAfterManualAreaChange();
                    }}
                    title={
                      hasLocalityOptions
                        ? "Narrow delivery to a specific area, or use the whole region"
                        : "Optional — no sub-areas are listed for this region yet"
                    }
                  >
                    <option value="">
                      {hasLocalityOptions
                        ? "All areas in region (optional)"
                        : "Whole region — optional"}
                    </option>
                    {serviceArea.localities.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {showStoreField && (
                <>
                  <label className="sr-only" htmlFor={storeFieldId}>
                    {multipleOutlets ? "Choose outlet" : "Outlet"}
                  </label>
                  <select
                    id={storeFieldId}
                    className={geoSelectClass}
                    value={
                      selectedStore && stores.some((s) => s.id === selectedStore.id)
                        ? selectedStore.id
                        : ""
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) return;
                      onStorePick(v);
                    }}
                    title={
                      multipleOutlets
                        ? "Several stores serve this area — choose where you want to shop"
                        : "Store for this delivery area"
                    }
                  >
                    {multipleOutlets && !selectedStore && (
                      <option value="" disabled>
                        Select an outlet
                      </option>
                    )}
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                        {s.address?.city ? ` — ${s.address.city}` : ""}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            {policy && policy.tier !== "standard" && (
              <div className="flex shrink-0 items-center sm:self-center">
                <DeliveryPolicyPopover
                  tier={policy.tier}
                  extendedFeeNote={policy.extendedFeeNote}
                  extendedLeadTimeNote={policy.extendedLeadTimeNote}
                  unservedMsg={policy.unservedCustomerMessage}
                />
              </div>
            )}
          </div>
        )}

        {stores.length === 0 && serviceArea && (
          <p className="text-xs text-muted-foreground">
            {serviceArea.emptyReason === "no_area_selected" &&
              "Choose your country and region, or use your location, so we can show the right store."}
            {serviceArea.emptyReason === "no_public_stores_for_area" &&
              "No stores serve this selection yet. Try another region or locality."}
            {serviceArea.emptyReason === "unserved_area" && policy?.tier !== "unserved" && (
              <span>No outlets available.</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
