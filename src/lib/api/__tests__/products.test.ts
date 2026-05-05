import { describe, expect, it, vi, afterEach } from "vitest";
import { getProductBySlug, getProductVariants, getProducts } from "../products";

describe("products API helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getProducts applies locale and default pagination to /api/products", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : input.toString();
      expect(url).toContain("/api/products?");
      expect(url).toContain("locale=en");
      return new Response(
        JSON.stringify({
          docs: [],
          totalDocs: 0,
          limit: 12,
          totalPages: 0,
          page: 1,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
          pagingCounter: 1,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    await getProducts({ locale: "en", page: 1 });
    expect(fetchMock).toHaveBeenCalled();
  });

  it("getProducts passes category filter when provided", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          docs: [],
          totalDocs: 0,
          limit: 12,
          totalPages: 0,
          page: 1,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
          pagingCounter: 1,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await getProducts({ locale: "en", category: "cat-uuid-1" });
    const url = String(fetchMock.mock.calls[0]?.[0] ?? "");
    expect(url).toContain("where%5Bcategories%5D%5Bin%5D=cat-uuid-1");
  });

  it("getProductBySlug returns first doc or null via MSW", async () => {
    const found = await getProductBySlug("mock-product", "en");
    expect(found?.slug).toBe("mock-product");
    const missing = await getProductBySlug("nope", "en");
    expect(missing).toBeNull();
  });

  it("getProductVariants returns array via MSW", async () => {
    const variants = await getProductVariants("p1");
    expect(Array.isArray(variants)).toBe(true);
  });
});
