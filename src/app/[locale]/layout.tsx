import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { AuthProvider } from "@/providers/auth-provider";
import { StoreProvider } from "@/providers/store-provider";
import { CartProvider } from "@/providers/cart-provider";
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

  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <StoreGate>
            <div className="flex min-h-screen flex-col">
              <Header locale={locale} />
              <main className="flex-1">{children}</main>
              <Footer locale={locale} />
              <CartDrawer locale={locale} />
            </div>
          </StoreGate>
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
