import { getPageBySlug } from "@/lib/api/pages";
import type { CmsLayoutBlock } from "@/lib/types/cms-page";
import { getMediaUrl } from "@/lib/utils/url";

/** Published `pages` document slug that powers the home hero carousel (multiple Hero blocks). */
export const HOME_HERO_PAGE_SLUG = "home-hero-banners";

export type HomeHeroSlide = {
  id?: string;
  heading: string;
  subheading: string;
  backgroundImageUrl: string | null;
  ctaLabel: string;
  ctaUrl: string;
};

function heroBlockToSlide(block: CmsLayoutBlock): HomeHeroSlide | null {
  if (block.blockType !== "hero") {
    return null;
  }
  const bg = block.backgroundImage;
  let backgroundImageUrl: string | null = null;
  if (bg && typeof bg === "object" && bg !== null && "url" in bg) {
    const url = (bg as { url?: string | null }).url;
    backgroundImageUrl = getMediaUrl(url ?? null);
  }

  return {
    id: typeof block.id === "string" ? block.id : undefined,
    heading: typeof block.heading === "string" ? block.heading : "",
    subheading: typeof block.subheading === "string" ? block.subheading : "",
    backgroundImageUrl,
    ctaLabel: typeof block.ctaLabel === "string" ? block.ctaLabel : "",
    ctaUrl: typeof block.ctaUrl === "string" ? block.ctaUrl.trim() : "",
  };
}

/** Hero blocks from the CMS page layout, in order (for carousel slides). */
export async function getHomeHeroSlides(locale: string): Promise<HomeHeroSlide[]> {
  try {
    const page = await getPageBySlug(HOME_HERO_PAGE_SLUG, locale);
    if (!page?.layout?.length) {
      return [];
    }
    return page.layout
      .map(heroBlockToSlide)
      .filter((s): s is HomeHeroSlide => s !== null);
  } catch {
    return [];
  }
}
