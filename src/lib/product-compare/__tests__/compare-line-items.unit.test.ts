import { describe, it, expect } from "vitest";
import { MAX_PRODUCT_COMPARE_ITEMS } from "@/lib/product-compare/constants";
import {
  compareLineKey,
  normalizeCompareLines,
  parseCompareItemsToken,
  parseLegacyCompareIdsParam,
  serializeCompareItemsQuery,
} from "@/lib/product-compare/compare-line-items";

describe("compare-line-items", () => {
  describe("compareLineKey", () => {
    it("should distinguish variant rows when product id is equal", () => {
      expect(compareLineKey({ productId: "p1", variantId: null })).toBe("p1:");
      expect(compareLineKey({ productId: "p1", variantId: "v1" })).toBe("p1:v1");
    });
  });

  describe("normalizeCompareLines", () => {
    it("should trim ids and drop empty product ids when trimming yields empty", () => {
      expect(
        normalizeCompareLines([
          { productId: "  a  ", variantId: "  v  " },
          { productId: "   ", variantId: "x" },
        ]),
      ).toEqual([{ productId: "a", variantId: "v" }]);
    });

    it("should coerce blank variant id to null", () => {
      expect(normalizeCompareLines([{ productId: "a", variantId: "" }])).toEqual([
        { productId: "a", variantId: null },
      ]);
      expect(normalizeCompareLines([{ productId: "a", variantId: "  " }])).toEqual([
        { productId: "a", variantId: null },
      ]);
    });

    it("should dedupe identical lines preserving first occurrence order", () => {
      expect(
        normalizeCompareLines([
          { productId: "a", variantId: null },
          { productId: "b", variantId: "v1" },
          { productId: "a", variantId: null },
          { productId: "b", variantId: "v1" },
        ]),
      ).toEqual([
        { productId: "a", variantId: null },
        { productId: "b", variantId: "v1" },
      ]);
    });

    it(`should cap list at MAX_PRODUCT_COMPARE_ITEMS (${MAX_PRODUCT_COMPARE_ITEMS})`, () => {
      const raw = Array.from({ length: 6 }, (_, i) => ({
        productId: `p${i}`,
        variantId: null as string | null,
      }));
      const out = normalizeCompareLines(raw);
      expect(out).toHaveLength(MAX_PRODUCT_COMPARE_ITEMS);
      expect(out.map((x) => x.productId)).toEqual(["p0", "p1", "p2", "p3"]);
    });
  });

  describe("serializeCompareItemsQuery / parseCompareItemsToken", () => {
    it("should round-trip normalized entries", () => {
      const entries = [
        { productId: "prod-a", variantId: null },
        { productId: "prod-b", variantId: "var-2" },
      ];
      const qs = serializeCompareItemsQuery(entries);
      expect(qs).toBe("prod-a,prod-b~var-2");
      expect(parseCompareItemsToken(qs)).toEqual(entries);
    });

    it("should parse comma segments with whitespace trimmed", () => {
      expect(parseCompareItemsToken(" a , b~v ")).toEqual([
        { productId: "a", variantId: null },
        { productId: "b", variantId: "v" },
      ]);
    });

    it("should return empty array when param is null or blank", () => {
      expect(parseCompareItemsToken(null)).toEqual([]);
      expect(parseCompareItemsToken("")).toEqual([]);
      expect(parseCompareItemsToken("  ,  , ")).toEqual([]);
    });

    it("should drop segment when product id missing before first tilde", () => {
      expect(parseCompareItemsToken("~only-variant")).toEqual([]);
    });
  });

  describe("parseLegacyCompareIdsParam", () => {
    it("should map comma-separated ids to variant-null lines", () => {
      expect(parseLegacyCompareIdsParam("x, y,z")).toEqual([
        { productId: "x", variantId: null },
        { productId: "y", variantId: null },
        { productId: "z", variantId: null },
      ]);
    });

    it("should return empty when param null or blank", () => {
      expect(parseLegacyCompareIdsParam(null)).toEqual([]);
      expect(parseLegacyCompareIdsParam("")).toEqual([]);
    });
  });
});
