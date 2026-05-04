import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact/contact-form";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    return {};
  }
  const dict = await getDictionary(locale as Locale);
  return { title: dict.contactPage.title };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{dict.contactPage.title}</h1>
      </header>
      <ContactForm
        strings={{
          intro: dict.contactPage.intro,
          nameLabel: dict.contactPage.nameLabel,
          emailLabel: dict.contactPage.emailLabel,
          messageLabel: dict.contactPage.messageLabel,
          submit: dict.contactPage.submit,
          missingEmailHint: dict.contactPage.missingEmailHint,
        }}
      />
    </main>
  );
}
