import { redirect } from "next/navigation";
import { i18nConfig } from "@/lib/i18n/config";

/** All routes live under `/[locale]/...`. Root `/` has no locale segment—send users to the default locale. */
export default function RootPage() {
  redirect(`/${i18nConfig.defaultLocale}`);
}
