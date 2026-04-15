"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter, useParams } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getAddresses, type Address } from "@/lib/api/addresses";
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
  AddressForm,
  type AddressFormValues,
  type ServiceAreaReadonlyFields,
} from "@/components/checkout/address-form";
import { ShippingSelector } from "@/components/checkout/shipping-selector";
import { OrderReview } from "@/components/checkout/order-review";
import { PaymentForm } from "@/components/checkout/payment-form";

const DEFAULT_VENDOR_KEY = "default";

type CheckoutStep = "address" | "shipping" | "review";

function toMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const body = error.body as Record<string, unknown> | null;
    if (body && typeof body.error === "string") {
      return body.error;
    }
    return `Request failed (${error.status}). Please try again.`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

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

function addressToSnapshot(address: Address): AddressSnapshot {
  return {
    firstName: address.firstName,
    lastName: address.lastName,
    street1: address.street1,
    street2: address.street2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone,
  };
}

export function CheckoutForm() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const guestId = useGuestId();
  const { items, subtotal, refreshCart } = useCart();
  const { serviceArea, canShopCurrentArea } = useStore();

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

  useEffect(() => {
    if (requireServiceAreaAlignedAddress) {
      setUseSavedAddress(false);
    }
  }, [requireServiceAreaAlignedAddress]);

  const [step, setStep] = useState<CheckoutStep>("address");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** After successful payment: cart is cleared before navigation — avoid flashing "cart is empty". */
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);

  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [draftedAddress, setDraftedAddress] = useState<AddressFormValues | null>(null);
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [guestPhone, setGuestPhone] = useState<string>("");

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
        isAuthenticated && user?.id ? getAddresses(user.id) : Promise.resolve([]),
      ]);

      setShippingMethods(methods);
      setCartId(activeCart?.id ?? null);
      setAddresses(userAddresses);

      if (userAddresses.length > 0) {
        setSelectedAddressId(userAddresses[0].id);
      }
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setIsLoadingData(false);
    }
  }, [guestId, isAuthenticated, isAuthLoading, user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedShippingMethodIds = useMemo(
    () =>
      vendorKeys
        .map((vendorKey) => selectedShippingByVendor[vendorKey])
        .filter((value): value is string => Boolean(value)),
    [selectedShippingByVendor, vendorKeys],
  );

  async function handleAddressSubmit(values: AddressFormValues) {
    setDraftedAddress(values);
    setGuestEmail(values.guestEmail ?? "");
    setGuestPhone(values.phone ?? "");
    setErrorMessage(null);
    setStep("shipping");
  }

  function continueWithSavedAddress() {
    if (!selectedAddressId) {
      setErrorMessage("Please select an address.");
      return;
    }
    setErrorMessage(null);
    setStep("shipping");
  }

  function continueShippingStep() {
    if (selectedShippingMethodIds.length !== vendorKeys.length) {
      setErrorMessage("Please select shipping methods for all groups.");
      return;
    }
    setErrorMessage(null);
    setStep("review");
  }

  async function submitCheckout() {
    if (!cartId) {
      setErrorMessage("Your cart is empty. Please add items before checkout.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let shippingAddress: AddressSnapshot | null = null;
      let billingAddress: AddressSnapshot | null = null;

      if (useSavedAddress && selectedAddressId) {
        const selected = addresses.find((entry) => entry.id === selectedAddressId);
        if (selected) {
          shippingAddress = addressToSnapshot(selected);
          billingAddress = addressToSnapshot(selected);
        }
      } else if (draftedAddress) {
        shippingAddress = toAddressSnapshot(draftedAddress);
        billingAddress = toAddressSnapshot(draftedAddress);
      }

      if (!shippingAddress || !billingAddress) {
        throw new Error("Please provide shipping and billing address.");
      }

      if (!isAuthenticated && !guestEmail.trim()) {
        throw new Error("Guest checkout requires a valid email.");
      }

      const response = await processCheckout(
        {
          cartId,
          shippingAddress,
          billingAddress,
          shippingMethodIds: selectedShippingMethodIds,
          guestEmail: !isAuthenticated ? guestEmail.trim() : undefined,
          guestPhone: !isAuthenticated && guestPhone.trim() ? guestPhone.trim() : undefined,
          simulatePayment: true,
        },
        !isAuthenticated ? guestId ?? undefined : undefined,
      );

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
      setErrorMessage(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingData) {
    return (
      <section className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
        Loading checkout...
      </section>
    );
  }

  if (checkoutComplete) {
    return (
      <section className="rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
        Taking you to your order confirmation…
      </section>
    );
  }

  if (items.length === 0 || !cartId) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
        Your cart is empty. Add products before checkout.
      </section>
    );
  }

  const showSavedAddressPicker =
    isAuthenticated &&
    addresses.length > 0 &&
    useSavedAddress &&
    !requireServiceAreaAlignedAddress;

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className={step === "address" ? "font-semibold text-slate-900 dark:text-slate-100" : ""}>
          Address
        </span>
        <span>•</span>
        <span className={step === "shipping" ? "font-semibold text-slate-900 dark:text-slate-100" : ""}>
          Shipping
        </span>
        <span>•</span>
        <span className={step === "review" ? "font-semibold text-slate-900 dark:text-slate-100" : ""}>
          Review
        </span>
      </div>

      {errorMessage ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {errorMessage}
        </p>
      ) : null}

      {step === "address" ? (
        showSavedAddressPicker ? (
          <section className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="text-lg font-semibold">Select Address</h3>
            <div className="space-y-2">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800"
                >
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="block font-medium">{address.label}</span>
                    <span className="block text-slate-600 dark:text-slate-300">
                      {address.firstName} {address.lastName}, {address.street1}, {address.city}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={continueWithSavedAddress}
                className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
              >
                Continue to Shipping
              </button>
              <button
                type="button"
                onClick={() => setUseSavedAddress(false)}
                className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
              >
                Use New Address
              </button>
            </div>
          </section>
        ) : (
          <section className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="text-lg font-semibold">
              {isAuthenticated ? "Add Address" : "Guest Checkout Address"}
            </h3>
            <AddressForm
              requireGuestEmail={!isAuthenticated && features.guestCheckout}
              defaultValues={draftedAddress ?? undefined}
              serviceAreaReadonly={serviceAreaReadonly}
              isSubmitting={isSubmitting}
              onSubmit={handleAddressSubmit}
            />
          </section>
        )
      ) : null}

      {step === "shipping" ? (
        <ShippingSelector
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
            selectedMethodIds={selectedShippingMethodIds}
            shippingMethods={shippingMethods}
          />
          <PaymentForm
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
