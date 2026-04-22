import type { PaginatedResponse } from "@/lib/types/api-response";
import type { Product } from "@/lib/types/product";
import { ITEMS_PER_PAGE } from "@/lib/utils/constants";

/** Safe default when catalog API calls fail so the UI can still render. */
export function emptyProductListingResponse(
  page = 1,
): PaginatedResponse<Product> {
  return {
    docs: [],
    totalDocs: 0,
    limit: ITEMS_PER_PAGE,
    totalPages: 0,
    page,
    pagingCounter: page,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  };
}
