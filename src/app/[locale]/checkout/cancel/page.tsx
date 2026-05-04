import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { fillOutcomeTemplate } from "@/lib/checkout/fill-outcome-template";

type CancelPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutCancelPage({ params, searchParams }: CancelPageProps) {
  const { locale } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);
  const o = dict.checkout.outcomes;
  const query = await searchParams;
  const orderRef =
    firstParam(query.orderNumber)?.trim() || firstParam(query.order)?.trim() || "";
  const refSuffix = orderRef ? fillOutcomeTemplate(o.refSuffixOrderNumber, { orderRef }) : "";
  const body = orderRef ? fillOutcomeTemplate(o.cancelWithRef, { refSuffix }) : o.cancelGeneric;

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-10 text-center sm:px-6 sm:text-left lg:px-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">{o.cancelTitle}</h1>
      <p className="text-sm text-muted-foreground">{body}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-start">
        <Link
          href={`/${locale}/cart`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          {o.returnToCart}
        </Link>
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm transition hover:bg-muted"
        >
          {o.continueShopping}
        </Link>
      </div>
    </main>
  );
}
