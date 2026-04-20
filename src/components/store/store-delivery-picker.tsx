"use client";

import { Fragment } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { useStore } from "@/lib/hooks/use-store";
import { DeliveryPolicyPopover } from "@/components/store/delivery-policy-popover";

export type StoreDeliveryPickerProps = {
  idPrefix?: string;
  layout: "compact" | "spacious";
  onCountryChange: (countryId: string) => void;
  onSubdivisionChange: (subdivisionId: string) => void;
  onLocalityChange: (localityId: string | null) => void;
  onStorePick: (storeId: string) => void;
};

const geoSelectClass =
  "w-full min-w-0 rounded-md border border-input bg-background py-2 pl-3 pr-9 text-xs text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50";

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

  const hasLocalities = Boolean(serviceArea && serviceArea.localities.length > 0);

  const listboxOptionsClass =
    layout === "spacious"
      ? "absolute left-0 right-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-card py-1 text-sm text-foreground shadow-lg outline-none lg:left-auto lg:right-0 lg:w-64"
      : "absolute right-0 z-50 mt-1 max-h-60 w-64 overflow-auto rounded-md border border-border bg-card py-1 text-sm text-foreground shadow-lg outline-none";

  const listboxButtonClass =
    layout === "spacious"
      ? "inline-flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/60 lg:h-9 lg:min-w-[14rem] lg:max-w-md lg:text-sm"
      : "inline-flex h-9 w-full min-w-0 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/60 sm:w-auto sm:max-w-[min(100%,16rem)] sm:text-sm";

  const titleTruncateClass =
    layout === "spacious"
      ? "min-w-0 flex-1 truncate text-left"
      : "max-w-[min(100%,12rem)] truncate sm:max-w-40";

  return (
    <div className="flex w-full max-w-full flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
      <div className="flex min-w-0 w-full flex-1 flex-col gap-2">
        {serviceArea && (
          <div
            className={
              hasLocalities
                ? "grid w-full grid-cols-1 gap-2 min-[400px]:grid-cols-2 xl:grid-cols-3"
                : "grid w-full grid-cols-1 gap-2 min-[400px]:grid-cols-2"
            }
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
                if (v === (serviceArea.selectedCountryId ?? "")) return;
                onCountryChange(v);
              }}
            >
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
                if (v === (serviceArea.selectedSubdivisionId ?? "")) return;
                onSubdivisionChange(v);
              }}
            >
              {serviceArea.subdivisions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {hasLocalities && (
              <>
                <label className="sr-only" htmlFor={locFieldId}>
                  Locality
                </label>
                <select
                  id={locFieldId}
                  className={`${geoSelectClass} min-[400px]:col-span-2 xl:col-span-1`}
                  value={serviceArea.selectedLocalityId ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    const next = v === "" ? null : v;
                    const cur = serviceArea.selectedLocalityId ?? null;
                    if (next === cur) return;
                    onLocalityChange(next);
                  }}
                >
                  <option value="">All areas in region</option>
                  {serviceArea.localities.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}

        {policy && policy.tier !== "standard" && (
          <div className="flex flex-wrap items-center gap-2">
            <DeliveryPolicyPopover
              tier={policy.tier}
              extendedFeeNote={policy.extendedFeeNote}
              extendedLeadTimeNote={policy.extendedLeadTimeNote}
              unservedMsg={policy.unservedCustomerMessage}
            />
          </div>
        )}

        {stores.length === 0 && serviceArea && (
          <p className="text-xs text-muted-foreground">
            {serviceArea.emptyReason === "no_public_stores_for_area" &&
              "No stores serve this selection yet. Try another region or locality."}
            {serviceArea.emptyReason === "unserved_area" && policy?.tier !== "unserved" && (
              <span>No outlets available.</span>
            )}
          </p>
        )}
      </div>

      {stores.length > 0 && (
        <Listbox value={selectedStore?.id ?? ""} onChange={onStorePick}>
          <div className="relative w-full min-w-0 shrink-0 lg:max-w-md">
            <ListboxButton className={listboxButtonClass}>
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4 shrink-0 text-muted-foreground"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 7l2-3h10l2 3M3 7v9a1 1 0 001 1h12a1 1 0 001-1V7M3 7h14M8 11h4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={titleTruncateClass}>
                {selectedStore?.name ?? "Select Store"}
              </span>
              <svg
                viewBox="0 0 20 20"
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 8l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </ListboxButton>

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className={listboxOptionsClass}>
                {stores.map((store) => (
                  <ListboxOption
                    key={store.id}
                    value={store.id}
                    className="cursor-pointer select-none px-3 py-2 transition data-focus:bg-muted data-selected:font-medium"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{store.name}</p>
                        {store.address?.city && (
                          <p className="truncate text-xs text-muted-foreground">
                            {[store.address.city, store.address.state].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                      {store.id === selectedStore?.id && (
                        <svg
                          viewBox="0 0 20 20"
                          className="h-4 w-4 shrink-0 text-primary"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M5 10l3 3 7-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    {store.storeDetails?.operatingHours && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {store.storeDetails.operatingHours}
                      </p>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        </Listbox>
      )}
    </div>
  );
}
