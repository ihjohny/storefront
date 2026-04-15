export const features = {
  multivendor: process.env.NEXT_PUBLIC_MULTIVENDOR_ENABLED === "true",
  guestCheckout: process.env.NEXT_PUBLIC_GUEST_CHECKOUT_ENABLED !== "false",
  socialLogin: process.env.NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED !== "false",
  reviews: process.env.NEXT_PUBLIC_REVIEWS_ENABLED !== "false",
  multiStore: process.env.NEXT_PUBLIC_MULTI_STORE_ENABLED === "true",
  singleStoreCart: process.env.NEXT_PUBLIC_SINGLE_STORE_CART === "true",
  i18n: {
    locales: (process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || "en,bn")
      .split(",")
      .map((locale) => locale.trim())
      .filter(Boolean),
    defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en",
  },
  currency: {
    supported: (process.env.NEXT_PUBLIC_SUPPORTED_CURRENCIES || "USD,BDT")
      .split(",")
      .map((currency) => currency.trim())
      .filter(Boolean),
    default: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "USD",
  },
} as const;

export type Features = typeof features;
