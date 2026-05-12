import { notFound } from "next/navigation";
import { ProductCompareTray } from "@/components/compare/product-compare-tray";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { AuthProvider } from "@/providers/auth-provider";
import { CartProvider } from "@/providers/cart-provider";
import { ProductCompareProvider } from "@/providers/product-compare-provider";
import { StoreProvider } from "@/providers/store-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { StoreGate } from "@/components/store/store-gate";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <ProductCompareProvider>
            <StoreGate>
              <div className="flex min-h-screen flex-col">
                <Header locale={locale} />
                <div className="min-w-0 flex-1">{children}</div>
                <Footer locale={locale} />
                <CartDrawer locale={locale} />
                <ProductCompareTray locale={locale} labels={dict.catalog.compare} />
              </div>
            </StoreGate>
          </ProductCompareProvider>
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
