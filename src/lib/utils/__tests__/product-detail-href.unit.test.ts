import { describe, expect, it } from "vitest";
import {
  buildProductDetailHref,
  orderItemProductDetailHref,
  orderItemProductSlug,
  orderItemVariantDocumentId,
  orderLineProductSlug,
  parseProductVariantSearchParam,
  pathnameSearchReplacingVariant,
} from "@/lib/utils/product-detail-href";

describe("pathnameSearchReplacingVariant", () => {
  it("should set variant and preserve other params", () => {
    const out = pathnameSearchReplacingVariant("/en/products/hat", "?utm=1", "vid-9");
    const u = new URL(`https://x.invalid${out}`);
    expect(u.searchParams.get("utm")).toBe("1");
    expect(u.searchParams.get("variant")).toBe("vid-9");
  });

  it("should replace existing variant", () => {
    const out = pathnameSearchReplacingVariant("/en/p", "?variant=old&utm=1", "new");
    const u = new URL(`https://x.invalid${out}`);
    expect(u.searchParams.get("utm")).toBe("1");
    expect(u.searchParams.get("variant")).toBe("new");
  });

  it("should drop variant when id blank", () => {
    expect(pathnameSearchReplacingVariant("/en/p", "?variant=old", "")).toBe("/en/p");
    const out = pathnameSearchReplacingVariant("/en/p", "?variant=old&utm=1", "   ");
    const u = new URL(`https://x.invalid${out}`);
    expect(u.searchParams.get("utm")).toBe("1");
    expect(u.searchParams.has("variant")).toBe(false);
  });
});

describe("buildProductDetailHref", () => {
  it("should omit query when variant id missing", () => {
    expect(buildProductDetailHref("en", "cool-hat")).toBe("/en/products/cool-hat");
    expect(buildProductDetailHref("en", "cool-hat", null)).toBe("/en/products/cool-hat");
    expect(buildProductDetailHref("en", "cool-hat", "   ")).toBe("/en/products/cool-hat");
  });

  it("should append variant query param when id provided", () => {
    expect(buildProductDetailHref("bn", "cool-hat", "vid-42")).toBe(
      "/bn/products/cool-hat?variant=vid-42",
    );
  });
});

describe("orderItem PDP helpers", () => {
  it("should return null slug when product is id-only string", () => {
    expect(orderItemProductSlug("abc123")).toBeNull();
    expect(orderItemProductSlug(undefined)).toBeNull();
  });

  it("should read slug from populated product", () => {
    expect(orderItemProductSlug({ id: "p1", slug: "cool-hat" })).toBe("cool-hat");
    expect(orderItemProductSlug({ id: "p1", slug: "   " })).toBeNull();
  });

  it("should read variant id from string or object", () => {
    expect(orderItemVariantDocumentId("vid-9")).toBe("vid-9");
    expect(orderItemVariantDocumentId({ id: "vid-9" })).toBe("vid-9");
    expect(orderItemVariantDocumentId(undefined)).toBeNull();
  });

  it("should prefer productSlug snapshot over populated product.slug when both exist", () => {
    expect(
      orderLineProductSlug({
        productSlug: "old-slug",
        product: { slug: "new-slug" },
      }),
    ).toBe("old-slug");
  });

  it("should build PDP href from productSlug when product relation is id-only string", () => {
    expect(
      orderItemProductDetailHref("en", {
        product: "prod-1",
        productSlug: "at-checkout",
        variant: "v1",
      }),
    ).toBe("/en/products/at-checkout?variant=v1");
  });

  it("should build PDP href when product slug available", () => {
    expect(
      orderItemProductDetailHref("en", {
        product: { slug: "hat" },
        variant: { id: "v1" },
      }),
    ).toBe("/en/products/hat?variant=v1");
    expect(orderItemProductDetailHref("en", { product: "prod-id-only", variant: "v1" })).toBeNull();
    expect(orderItemProductDetailHref("en", { product: { slug: "hat" } })).toBe("/en/products/hat");
  });
});

describe("parseProductVariantSearchParam", () => {
  it("should read variant id from query", () => {
    expect(parseProductVariantSearchParam({ variant: "abc" })).toBe("abc");
    expect(parseProductVariantSearchParam({ variant: ["x", "y"] })).toBe("x");
  });

  it("should return undefined when missing or blank", () => {
    expect(parseProductVariantSearchParam({})).toBeUndefined();
    expect(parseProductVariantSearchParam({ variant: "" })).toBeUndefined();
    expect(parseProductVariantSearchParam({ variant: "   " })).toBeUndefined();
  });
});
