import type { Locale } from "./config";
import type dictionaryEn from "./dictionaries/en.json";
import type { CheckoutOutcomesCopy } from "@/lib/types/checkout-copy";

type DictionaryJson = typeof dictionaryEn;

/** Canonical dictionary shape; `checkout.outcomes` intersected so TS sees it even when JSON inference is shallow. */
export type Dictionary = Omit<DictionaryJson, "checkout"> & {
  checkout: DictionaryJson["checkout"] & { outcomes: CheckoutOutcomesCopy };
};

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((m) => m.default as Dictionary),
  bn: () => import("./dictionaries/bn.json").then((m) => m.default as Dictionary),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
