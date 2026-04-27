import type { Locale } from "./config";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  bn: () => import("./dictionaries/bn.json").then((m) => m.default),
} as const;

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
