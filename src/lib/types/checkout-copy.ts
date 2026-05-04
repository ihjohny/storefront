/** Mirrors dictionary path checkout.shipping — used by checkout + PDP delivery list. */
export type CheckoutShippingCopy = {
  headingSingle: string;
  headingVendor: string;
  continueReview: string;
  back: string;
  emptyTitle: string;
  emptyBody: string;
  selectAllGroupsError: string;
  typeFlat: string;
  typePerItem: string;
  typeWeight: string;
  hintPickup: string;
  hintCod: string;
  hintCourier: string;
  minOrder: string;
  maxOrder: string;
};

export type CheckoutGuestContactCopy = {
  reviewBannerEither: string;
  reviewBannerEmail: string;
  reviewBannerPhone: string;
  fieldHintEmailEither: string;
  fieldHintEmailRequired: string;
  fieldHintPhoneEither: string;
  fieldHintPhoneRequired: string;
};

export type CheckoutPaymentLabelsCopy = {
  titleOnline: string;
  titleCod: string;
  summarySimulated: string;
  summarySsl: string;
  summaryCod: string;
  back: string;
  processing: string;
  placeOrderSimulated: string;
  continueToPayment: string;
  placeOrderCod: string;
};

export type CheckoutOutcomesCopy = {
  successHeading: string;
  successSubtitleOnlinePaid: string;
  successSubtitleCod: string;
  codPaymentBanner: string;
  successFallbackTitle: string;
  successFallbackBody: string;
  successFallbackOrderNumberLine: string;
  successFallbackTrackHint: string;
  copyOrderNumber: string;
  copied: string;
  saveOrderNumberHint: string;
  failedTitle: string;
  failedWithRef: string;
  failedGeneric: string;
  cancelTitle: string;
  cancelWithRef: string;
  cancelGeneric: string;
  refSuffixOrderNumber: string;
  tryCheckoutAgain: string;
  contactSupport: string;
  returnToCart: string;
  continueShopping: string;
  trackYourOrder: string;
};

/** Client checkout strings from `getDictionary(locale).checkout`. */
export type CheckoutPageCopy = {
  title: string;
  intro: string;
  loading: string;
  redirecting: string;
  emptyCart: string;
  stepAddress: string;
  stepShipping: string;
  stepReview: string;
  selectAddressTitle: string;
  continueToShipping: string;
  useNewAddress: string;
  addAddressTitle: string;
  guestAddressTitle: string;
  selectAddressError: string;
  guestContact: CheckoutGuestContactCopy;
  paymentLabels: CheckoutPaymentLabelsCopy;
  shipping: CheckoutShippingCopy;
  outcomes: CheckoutOutcomesCopy;
};
