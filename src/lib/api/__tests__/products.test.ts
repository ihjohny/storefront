import { describe, expect, it, vi, afterEach } from "vitest";
import { getProductBySlug, getProductVariants, getProducts, getProductById } from "../products";

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

  it("getProductById requests published product by id", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : input.toString();
      expect(url).toContain("where%5Bid%5D%5Bequals%5D=published-id");
      expect(url).toContain("locale=en");
      return new Response(
        JSON.stringify({
          docs: [
            {
              id: "published-id",
              name: "P",
              slug: "p",
              status: "published",
              basePrice: 1,
              currency: "USD",
              categories: [],
              images: [],
              hasVariants: false,
              tenant: null,
            },
          ],
          totalDocs: 1,
          limit: 1,
          totalPages: 1,
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

    const { getProductById } = await import("../products");
    const found = await getProductById("published-id", "en");
    expect(found?.id).toBe("published-id");
    expect(fetchMock).toHaveBeenCalled();
  });

  it("getProductVariants returns array via MSW", async () => {
    const variants = await getProductVariants("p1");
    expect(Array.isArray(variants)).toBe(true);
  });
});
