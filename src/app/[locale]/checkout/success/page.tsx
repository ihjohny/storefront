import { notFound } from "next/navigation";
import { CheckoutSuccessContent } from "@/components/checkout/checkout-success-content";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18nConfig, type Locale } from "@/lib/i18n/config";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

type SuccessPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutSuccessPage({ params, searchParams }: SuccessPageProps) {
  const { locale } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);
  const query = await searchParams;
  /** SSL Commerz success URL uses `orderNumber=`; COD redirect uses `order=` (id). */
  const fallbackOrderNumber = firstParam(query.orderNumber);
  const fallbackOrderId = firstParam(query.order);

  return (
    <CheckoutSuccessContent
      outcomes={dict.checkout.outcomes}
      fallbackOrderId={fallbackOrderId}
      fallbackOrderNumber={fallbackOrderNumber}
    />
  );
}
