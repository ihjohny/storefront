"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter, useParams } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  createAddress,
  getAddressesPage,
  updateAddress,
  type Address,
  type AddressInput,
} from "@/lib/api/addresses";
import { getShippingMethods, type ShippingMethod } from "@/lib/api/shipping";
import { processCheckout } from "@/lib/api/orders";
import type { AddressSnapshot } from "@/lib/types/order";
import { getCart } from "@/lib/api/cart";
import { features } from "@/lib/config/features";
import { useAuth } from "@/lib/hooks/use-auth";
import { useGuestId } from "@/lib/hooks/use-guest-id";
import { useCart } from "@/lib/hooks/use-cart";
import { useStore } from "@/lib/hooks/use-store";
import {
  readGeocodedAddressFormPartial,
  type GeocodedAddressFormPartial,
} from "@/lib/geolocation/geocoded-delivery-storage";
import {
  AddressForm,
  type AddressFormValues,
  type ServiceAreaReadonlyFields,
} from "@/components/checkout/address-form";
import { ShippingSelector } from "@/components/checkout/shipping-selector";
import { OrderReview } from "@/components/checkout/order-review";
import { PaymentForm } from "@/components/checkout/payment-form";
import type { CheckoutPageCopy } from "@/lib/types/checkout-copy";
import { assertGuestContactAllowed } from "@/lib/checkout/guest-contact-validation";
import { shippingSelectionsAreAllCod } from "@/lib/shipping/shipping-display";
import { isAddressCompatibleWithServiceArea } from "@/lib/checkout/address-store-compatibility";

const DEFAULT_VENDOR_KEY = "default";
const CHECKOUT_ADDRESS_PAGE_SIZE = 8;

type CheckoutStep = "address" | "shipping" | "review";

function toAddressSnapshot(values: AddressFormValues): AddressSnapshot {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    street1: values.street1,
    street2: values.street2 || null,
    city: values.city,
    state: values.state || null,
    postalCode: values.postalCode,
    country: values.country.toUpperCase(),
    phone: values.phone || null,
  };
}

function addressToFormValues(address: Address): AddressFormValues {
  return {
    label: address.label,
    firstName: address.firstName,
    lastName: address.lastName,
    street1: address.street1,
    street2: address.street2 ?? "",
    city: address.city,
    state: address.state ?? "",
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone ?? "",
    guestEmail: "",
  };
}

function toAddressInput(
  values: AddressFormValues,
  userId: string,
  selectedStoreId?: string,
  serviceArea?: {
    selectedCountryId: string | null;
    selectedSubdivisionId: string | null;
    selectedLocalityId: string | null;
  } | null,
): AddressInput {
  return {
    user: userId,
    label: values.label,
    firstName: values.firstName,
    lastName: values.lastName,
    street1: values.street1,
    street2: values.street2 || null,
    city: values.city,
    state: values.state || null,
    postalCode: values.postalCode,
    country: values.country.toUpperCase(),
    geoCountryId: serviceArea?.selectedCountryId ?? null,
    geoSubdivisionId: serviceArea?.selectedSubdivisionId ?? null,
    geoLocalityId: serviceArea?.selectedLocalityId ?? null,
    preferredStoreId: selectedStoreId ?? null,
    phone: values.phone || null,
    isDefault: false,
  };
}

type CheckoutFormProps = {
  copy: CheckoutPageCopy;
};

export function CheckoutForm({ copy }: CheckoutFormProps) {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const guestId = useGuestId();
  const { items, subtotal, discountTotal, refreshCart } = useCart();
  const { serviceArea, canShopCurrentArea, commerceStore } = useStore();

  const serviceAreaReadonly: ServiceAreaReadonlyFields | undefined = useMemo(() => {
    if (!features.serviceAreaStoreSelection || !features.geography) return undefined;
    if (!serviceArea || !canShopCurrentArea) return undefined;
    const c = serviceArea.countries.find((x) => x.id === serviceArea.selectedCountryId);
    const sub = serviceArea.subdivisions.find((x) => x.id === serviceArea.selectedSubdivisionId);
    if (!c || !sub) return undefined;
    const loc = serviceArea.selectedLocalityId
      ? serviceArea.localities.find((l) => l.id === serviceArea.selectedLocalityId)
      : null;
    return {
      countryIso: c.isoCode.slice(0, 2).toUpperCase(),
      region: sub.name,
      localityName: loc?.name ?? null,
    };
  }, [serviceArea, canShopCurrentArea]);

  const requireServiceAreaAlignedAddress =
    Boolean(serviceAreaReadonly) && canShopCurrentArea;

  const [step, setStep] = useState<CheckoutStep>("address");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** After successful payment: cart is cleared before navigation — avoid flashing "cart is empty". */
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesPage, setAddressesPage] = useState(1);
  const [addressesTotalPages, setAddressesTotalPages] = useState(1);
  const [isLoadingMoreAddresses, setIsLoadingMoreAddresses] = useState(false);
  const [addressSearchTerm, setAddressSearchTerm] = useState("");
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [draftedAddress, setDraftedAddress] = useState<AddressFormValues | null>(null);
  const [geocodePrefill, setGeocodePrefill] = useState<GeocodedAddressFormPartial | null>(null);
  const [addressFormKey, setAddressFormKey] = useState(0);
  const [saveAddressForLater, setSaveAddressForLater] = useState(true);
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [guestPhone, setGuestPhone] = useState<string>("");

  const compatibleAddressIds = useMemo(() => {
    if (!requireServiceAreaAlignedAddress) {
      return new Set(addresses.map((entry) => entry.id));
    }
    return new Set(
      addresses
        .filter((entry) => isAddressCompatibleWithServiceArea(entry, serviceArea))
        .map((entry) => entry.id),
    );
  }, [addresses, requireServiceAreaAlignedAddress, serviceArea]);
  const compatibleAddresses = useMemo(
    () => addresses.filter((entry) => compatibleAddressIds.has(entry.id)),
    [addresses, compatibleAddressIds],
  );
  const incompatibleAddresses = useMemo(
    () => addresses.filter((entry) => !compatibleAddressIds.has(entry.id)),
    [addresses, compatibleAddressIds],
  );
  const normalizedAddressSearch = addressSearchTerm.trim().toLowerCase();
  const searchedCompatibleAddresses = useMemo(() => {
    if (!normalizedAddressSearch) return compatibleAddresses;
    return compatibleAddresses.filter((entry) =>
      [
        entry.label,
        entry.firstName,
        entry.lastName,
        entry.street1,
        entry.street2 ?? "",
        entry.city,
        entry.state ?? "",
        entry.postalCode,
        entry.country,
        entry.phone ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedAddressSearch),
    );
  }, [compatibleAddresses, normalizedAddressSearch]);
  const searchedIncompatibleAddresses = useMemo(() => {
    if (!normalizedAddressSearch) return incompatibleAddresses;
    return incompatibleAddresses.filter((entry) =>
      [
        entry.label,
        entry.firstName,
        entry.lastName,
        entry.street1,
        entry.street2 ?? "",
        entry.city,
        entry.state ?? "",
        entry.postalCode,
        entry.country,
        entry.phone ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedAddressSearch),
    );
  }, [incompatibleAddresses, normalizedAddressSearch]);
  const canLoadMoreSavedAddresses = addressesPage < addressesTotalPages;
  const hasNoCompatibleSavedAddress =
    isAuthenticated &&
    addresses.length > 0 &&
    compatibleAddresses.length === 0 &&
    !selectedAddressId &&
    !draftedAddress;

  const vendorKeys = useMemo(() => {
    if (!features.multivendor || features.singleStoreCart) {
      return [DEFAULT_VENDOR_KEY];
    }

    const keys = Array.from(
      new Set(items.map((item) => item.vendor?.id || item.vendor?.name || DEFAULT_VENDOR_KEY)),
    );
    return keys.length > 0 ? keys : [DEFAULT_VENDOR_KEY];
  }, [items]);

  const [selectedShippingByVendor, setSelectedShippingByVendor] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (shippingMethods.length === 0) {
      return;
    }

    setSelectedShippingByVendor((prev) => {
      const next = { ...prev };
      vendorKeys.forEach((vendorKey) => {
        if (!next[vendorKey]) {
          next[vendorKey] = shippingMethods[0].id;
        }
      });
      return next;
    });
  }, [shippingMethods, vendorKeys]);

  function selectSavedAddress(id: string) {
    const selected = addresses.find((entry) => entry.id === id);
    if (!selected) return;
    if (requireServiceAreaAlignedAddress && !compatibleAddressIds.has(selected.id)) {
      setErrorMessage("Selected address is not compatible with your current store area.");
      return;
    }
    setSelectedAddressId(selected.id);
    setDraftedAddress(addressToFormValues(selected));
    setErrorMessage(null);
  }

  function startWithBlankAddress() {
    setSelectedAddressId("");
    setDraftedAddress(null);
    setErrorMessage(null);
  }

  async function loadMoreSavedAddresses() {
    if (!isAuthenticated || !user?.id) return;
    if (!canLoadMoreSavedAddresses || isLoadingMoreAddresses) return;
    setIsLoadingMoreAddresses(true);
    try {
      const nextPage = addressesPage + 1;
      const response = await getAddressesPage(user.id, {
        page: nextPage,
        limit: CHECKOUT_ADDRESS_PAGE_SIZE,
      });
      setAddresses((prev) => {
        const existingIds = new Set(prev.map((entry) => entry.id));
        const appended = response.docs.filter((entry) => !existingIds.has(entry.id));
        return [...prev, ...appended];
      });
      setAddressesPage(response.page);
      setAddressesTotalPages(response.totalPages || 1);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoadingMoreAddresses(false);
    }
  }

  const loadData = useCallback(async () => {
    if (isAuthLoading) {
      return;
    }

    setIsLoadingData(true);
    setErrorMessage(null);

    try {
      const [methods, activeCart, userAddresses] = await Promise.all([
        getShippingMethods(),
        getCart(user?.id, isAuthenticated ? undefined : guestId ?? undefined),
        isAuthenticated && user?.id
          ? getAddressesPage(user.id, { page: 1, limit: CHECKOUT_ADDRESS_PAGE_SIZE })
          : Promise.resolve(null),
      ]);

      setShippingMethods(methods);
      setCartId(activeCart?.id ?? null);
      const initialAddresses = userAddresses?.docs ?? [];
      setAddresses(initialAddresses);
      setAddressesPage(userAddresses?.page ?? 1);
      setAddressesTotalPages(userAddresses?.totalPages ?? 1);

      if (initialAddresses.length > 0) {
        const firstCompatible = initialAddresses.find((entry) =>
          isAddressCompatibleWithServiceArea(entry, serviceArea),
        );
        setSelectedAddressId(firstCompatible?.id ?? "");
        setDraftedAddress(firstCompatible ? addressToFormValues(firstCompatible) : null);
      } else {
        setSelectedAddressId("");
        setDraftedAddress(null);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoadingData(false);
    }
  }, [guestId, isAuthenticated, isAuthLoading, user?.id, serviceArea]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useLayoutEffect(() => {
    if (isLoadingData) return;
    setGeocodePrefill(readGeocodedAddressFormPartial());
    setAddressFormKey((k) => k + 1);
  }, [isLoadingData]);

  const userProfileAddressDefaults = useMemo((): Partial<AddressFormValues> => {
    if (!isAuthenticated || !user) return {};
    return {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",
    };
  }, [isAuthenticated, user]);

  const addressMergedDefaults = useMemo((): Partial<AddressFormValues> => {
    const merged = {
      ...userProfileAddressDefaults,
      ...geocodePrefill,
      ...(draftedAddress ?? {}),
    };
    if (!hasNoCompatibleSavedAddress) return merged;
    // Force manual confirmation for fine-grained street details when none of the saved
    // addresses are compatible with the active store coverage.
    return {
      ...merged,
      street1: "",
      street2: "",
      postalCode: "",
    };
  }, [userProfileAddressDefaults, geocodePrefill, draftedAddress, hasNoCompatibleSavedAddress]);

  const selectedShippingMethodIds = useMemo(
    () =>
      vendorKeys
        .map((vendorKey) => selectedShippingByVendor[vendorKey])
        .filter((value): value is string => Boolean(value)),
    [selectedShippingByVendor, vendorKeys],
  );

  const guestBannerText = useMemo(() => {
    if (isAuthenticated || !features.guestCheckout) return null;
    const mode = features.authRequiredIdentifier;
    if (mode === "email") return copy.guestContact.reviewBannerEmail;
    if (mode === "phone") return copy.guestContact.reviewBannerPhone;
    return copy.guestContact.reviewBannerEither;
  }, [isAuthenticated, copy]);

  const checkoutAllCod = useMemo(
    () => shippingSelectionsAreAllCod(shippingMethods, selectedShippingMethodIds),
    [shippingMethods, selectedShippingMethodIds],
  );

  async function handleAddressSubmit(values: AddressFormValues) {
    setDraftedAddress(values);
    setGuestEmail(values.guestEmail ?? "");
    setGuestPhone(values.phone ?? "");
    setErrorMessage(null);

    if (isAuthenticated && user?.id && saveAddressForLater) {
      try {
        const payload = toAddressInput(values, user.id, commerceStore?.id, serviceArea);
        const existingSelected = selectedAddressId
          ? addresses.find((entry) => entry.id === selectedAddressId) ?? null
          : null;
        if (existingSelected) {
          const updated = await updateAddress(existingSelected.id, payload);
          setAddresses((prev) =>
            prev.map((entry) => (entry.id === updated.id ? { ...entry, ...updated } : entry)),
          );
          setSelectedAddressId(updated.id);
        } else {
          const created = await createAddress(payload);
          setAddresses((prev) => [created, ...prev.filter((entry) => entry.id !== created.id)]);
          setSelectedAddressId(created.id);
        }
      } catch (error) {
        console.warn("[checkout] failed to save address for later", error);
        setErrorMessage(copy.saveAddressFailedNotice);
      }
    }

    setStep("shipping");
  }

  function continueShippingStep() {
    if (selectedShippingMethodIds.length !== vendorKeys.length) {
      setErrorMessage(copy.shipping.selectAllGroupsError);
      return;
    }
    setErrorMessage(null);
    setStep("review");
  }

  async function submitCheckout() {
    if (!cartId) {
      setErrorMessage(copy.emptyCart);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let shippingAddress: AddressSnapshot | null = null;
      let billingAddress: AddressSnapshot | null = null;

      if (draftedAddress) {
        shippingAddress = toAddressSnapshot(draftedAddress);
        billingAddress = toAddressSnapshot(draftedAddress);
      }

      if (!shippingAddress || !billingAddress) {
        throw new Error("Please provide shipping and billing address.");
      }

      if (!isAuthenticated) {
        assertGuestContactAllowed(features.authRequiredIdentifier, guestEmail, guestPhone);
      }

      const codOnly = shippingSelectionsAreAllCod(shippingMethods, selectedShippingMethodIds);

      const response = await processCheckout(
        {
          cartId,
          shippingAddress,
          billingAddress,
          shippingMethodIds: selectedShippingMethodIds,
          storeId: commerceStore?.id,
          serviceArea: serviceArea
            ? {
                countryId: serviceArea.selectedCountryId,
                subdivisionId: serviceArea.selectedSubdivisionId,
                localityId: serviceArea.selectedLocalityId,
              }
            : undefined,
          guestEmail:
            !isAuthenticated && guestEmail.trim() ? guestEmail.trim().toLowerCase() : undefined,
          guestPhone: !isAuthenticated && guestPhone.trim() ? guestPhone.trim() : undefined,
          simulatePayment: codOnly ? false : features.checkoutSimulatePayment,
          cashOnDelivery: codOnly,
        },
        !isAuthenticated ? guestId ?? undefined : undefined,
      );

      /* Commit before cart context clears (refreshCart) so we never render the empty-cart branch */
      flushSync(() => {
        setCheckoutComplete(true);
      });

      try {
        sessionStorage.setItem("bs-checkout-result", JSON.stringify(response));
      } catch {
        /* sessionStorage may be unavailable */
      }

      if (response.paymentRedirectUrl) {
        window.location.href = response.paymentRedirectUrl;
      } else {
        const orderId = response.order?.id;
        router.push(`/${params.locale}/checkout/success?order=${orderId}`);
      }

      queueMicrotask(() => {
        void refreshCart();
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingData) {
    return (
      <section className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
        {copy.loading}
      </section>
    );
  }

  if (checkoutComplete) {
    return (
      <section className="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
        {copy.redirecting}
      </section>
    );
  }

  if (items.length === 0 || !cartId) {
    return (
      <section className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {copy.emptyCart}
      </section>
    );
  }

  const showSavedAddressPicker = isAuthenticated && addresses.length > 0;

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={step === "address" ? "font-semibold text-foreground" : ""}>
          {copy.stepAddress}
        </span>
        <span>•</span>
        <span className={step === "shipping" ? "font-semibold text-foreground" : ""}>
          {copy.stepShipping}
        </span>
        <span>•</span>
        <span className={step === "review" ? "font-semibold text-foreground" : ""}>
          {copy.stepReview}
        </span>
      </div>

      {errorMessage ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      {step === "address" ? (
        <section className="space-y-3 rounded-xl border border-border p-4">
          {showSavedAddressPicker ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">{copy.selectAddressTitle}</h3>
              <p className="text-xs text-muted-foreground">{copy.savedAddressPrefillHint}</p>
              <label className="block">
                <span className="sr-only">Search saved addresses</span>
                <input
                  type="search"
                  value={addressSearchTerm}
                  onChange={(event) => setAddressSearchTerm(event.currentTarget.value)}
                  placeholder="Search saved addresses"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              {searchedCompatibleAddresses.length > 0 ? (
                <div className="space-y-2">
                  {searchedCompatibleAddresses.map((address) => (
                    <label
                      key={address.id}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 text-sm"
                    >
                      <input
                        type="radio"
                        name="selectedAddress"
                        checked={selectedAddressId === address.id}
                        onChange={() => selectSavedAddress(address.id)}
                        className="mt-0.5"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{address.label}</span>
                        <span className="block text-muted-foreground">
                          {address.firstName} {address.lastName}, {address.street1}, {address.city}
                        </span>
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs text-muted-foreground">
                            {copy.showSavedAddressDetails}
                          </summary>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {address.firstName} {address.lastName}
                            <br />
                            {address.street1}
                            {address.street2 ? `, ${address.street2}` : ""}
                            <br />
                            {address.city}
                            {address.state ? `, ${address.state}` : ""} {address.postalCode}
                            <br />
                            {address.country}
                            {address.phone ? `, ${address.phone}` : ""}
                          </span>
                        </details>
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {normalizedAddressSearch
                    ? "No matching compatible addresses found for your search."
                    : "No compatible saved addresses for the current store area. Add a new address."}
                </p>
              )}
              {searchedIncompatibleAddresses.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Other saved addresses (not compatible with current store):
                  </p>
                  {searchedIncompatibleAddresses.map((address) => (
                    <details
                      key={address.id}
                      className="rounded-md border border-border bg-muted/40 p-3 text-sm"
                    >
                      <summary className="cursor-pointer font-medium">
                        {address.label} - {address.firstName} {address.lastName}, {address.city}
                      </summary>
                      <p className="mt-2 text-muted-foreground">
                        {address.street1}
                        {address.street2 ? `, ${address.street2}` : ""}
                        <br />
                        {address.city}
                        {address.state ? `, ${address.state}` : ""} {address.postalCode}
                        <br />
                        {address.country}
                        {address.phone ? `, ${address.phone}` : ""}
                      </p>
                    </details>
                  ))}
                </div>
              ) : null}
              {canLoadMoreSavedAddresses ? (
                <button
                  type="button"
                  onClick={() => void loadMoreSavedAddresses()}
                  disabled={isLoadingMoreAddresses}
                  className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-xs transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingMoreAddresses ? "Loading..." : "Load more saved addresses"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={startWithBlankAddress}
                className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-xs transition hover:bg-muted"
              >
                {copy.startFromBlankAddress}
              </button>
            </div>
          ) : null}

          <h3 className="text-lg font-semibold">
            {isAuthenticated ? copy.addAddressTitle : copy.guestAddressTitle}
          </h3>
          {isAuthenticated ? (
            <label className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={saveAddressForLater}
                onChange={(event) => setSaveAddressForLater(event.currentTarget.checked)}
                className="mt-0.5"
              />
              <span>
                {selectedAddressId ? copy.saveAddressChangesLabel : copy.saveAddressForLaterLabel}
              </span>
            </label>
          ) : null}
          <AddressForm
            key={`${addressFormKey}-${selectedAddressId || "new"}-${draftedAddress ? "draft" : "fresh"}`}
            isGuestCheckout={!isAuthenticated && features.guestCheckout}
            guestIdentifierMode={
              !isAuthenticated && features.guestCheckout ? features.authRequiredIdentifier : undefined
            }
            guestContactCopy={copy.guestContact}
            guestBannerText={guestBannerText ?? undefined}
            defaultValues={addressMergedDefaults}
            serviceAreaReadonly={serviceAreaReadonly}
            isSubmitting={isSubmitting}
            submitLabel={copy.continueToShipping}
            onSubmit={handleAddressSubmit}
          />
        </section>
      ) : null}

      {step === "shipping" ? (
        <ShippingSelector
          copy={copy.shipping}
          vendorKeys={vendorKeys}
          methods={shippingMethods}
          selectedByVendor={selectedShippingByVendor}
          onChange={(vendorKey, methodId) =>
            setSelectedShippingByVendor((prev) => ({ ...prev, [vendorKey]: methodId }))
          }
          onBack={() => setStep("address")}
          onContinue={continueShippingStep}
        />
      ) : null}

      {step === "review" ? (
        <div className="space-y-4">
          <OrderReview
            items={items}
            subtotal={subtotal}
            discountTotal={discountTotal}
            selectedMethodIds={selectedShippingMethodIds}
            shippingMethods={shippingMethods}
          />
          <PaymentForm
            paymentMode={checkoutAllCod ? "cod" : "online"}
            simulatePayment={checkoutAllCod ? false : features.checkoutSimulatePayment}
            labels={copy.paymentLabels}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            onBack={() => setStep("shipping")}
            onSubmit={submitCheckout}
          />
        </div>
      ) : null}
    </section>
  );
}
