"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { pathnameSearchReplacingVariant } from "@/lib/utils/product-detail-href";

type UseSyncProductVariantSearchParamArgs = {
  /** Payload `product-variants` document id for the current UI selection. */
  selectedVariantId: string | undefined | null;
  /** When false, skips writes (e.g. Quick View must not change the underlying page URL). */
  enabled?: boolean;
};

/**
 * Keeps `?variant=` aligned with the selected variant so PDP URLs are shareable.
 * Uses `router.replace` so Next.js routing state matches the address bar (analytics-friendly).
 * Other query keys on the same URL are preserved (`pathnameSearchReplacingVariant`).
 */
export function useSyncProductVariantSearchParam({
  selectedVariantId,
  enabled = true,
}: UseSyncProductVariantSearchParamArgs): void {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const id =
      selectedVariantId != null && String(selectedVariantId).trim() !== ""
        ? String(selectedVariantId).trim()
        : "";

    const url = new URL(window.location.href);
    const current = url.searchParams.get("variant")?.trim() ?? "";

    if (id === current) {
      return;
    }

    const search = window.location.search;
    const next = pathnameSearchReplacingVariant(pathname, search, id);
    const currentFull = `${window.location.pathname}${search}`;
    if (next === currentFull) {
      return;
    }

    router.replace(next, { scroll: false });
  }, [selectedVariantId, enabled, pathname, router]);
}
