import type { Media } from "@/lib/types/product";

/** Payload `pages` document (subset used by the storefront). */
export type CmsPage = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  layout: CmsLayoutBlock[] | null;
  meta?: {
    title?: string | null;
    description?: string | null;
    image?: Media | string | null;
  } | null;
};

export type CmsLayoutBlock = {
  id?: string;
  blockType: string;
  [key: string]: unknown;
};
