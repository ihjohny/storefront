import { apiClient } from "@/lib/api/client";
import type { CmsPage } from "@/lib/types/cms-page";
import type { PaginatedResponse } from "@/lib/types/api-response";

/**
 * Fetches a published CMS page by slug for the given content locale.
 * Uses the same first URL segment as the app (`/[locale]/[slug]`), so slugs must not
 * collide with static routes (enforced in Payload `pages` collection).
 */
export async function getPageBySlug(
  slug: string,
  locale: string,
): Promise<CmsPage | null> {
  const params = new URLSearchParams();
  params.set("where[slug][equals]", slug);
  params.set("where[status][equals]", "published");
  params.set("limit", "1");
  params.set("depth", "2");
  params.set("locale", locale);

  const res = await apiClient<PaginatedResponse<CmsPage>>(`/pages?${params.toString()}`, {
    locale,
  });

  return res.docs[0] ?? null;
}
