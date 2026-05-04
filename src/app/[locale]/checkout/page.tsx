import { notFound } from "next/navigation";
import { CheckoutPageClient } from "@/components/checkout/checkout-page-client";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import type { CheckoutPageCopy } from "@/lib/types/checkout-copy";

type CheckoutPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);
  const checkout = dict.checkout as unknown as CheckoutPageCopy;

  return <CheckoutPageClient checkout={checkout} />;
}
