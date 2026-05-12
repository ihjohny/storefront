import { describe, expect, it } from "vitest";
import { collapseGhostVariantCartLines } from "@/lib/utils/collapse-cart-ghost-lines";

describe("collapseGhostVariantCartLines", () => {
  it("should merge product-only line into the single variant line for that product", () => {
    expect(
      collapseGhostVariantCartLines([
        { product: "p1", quantity: 1 },
        { product: "p1", variant: "v1", quantity: 3 },
      ]),
    ).toEqual([{ product: "p1", variant: "v1", quantity: 4 }]);
  });

  it("should merge multiple ghost lines before rolling into sole variant", () => {
    expect(
      collapseGhostVariantCartLines([
        { product: "p1", quantity: 1 },
        { product: "p1", quantity: 2 },
        { product: "p1", variant: "v1", quantity: 3 },
      ]),
    ).toEqual([{ product: "p1", variant: "v1", quantity: 6 }]);
  });

  it("should not merge ghost qty when two variants exist for same product", () => {
    expect(
      collapseGhostVariantCartLines([
        { product: "p1", quantity: 1 },
        { product: "p1", variant: "v1", quantity: 2 },
        { product: "p1", variant: "v2", quantity: 3 },
      ]),
    ).toEqual([
      { product: "p1", quantity: 1 },
      { product: "p1", variant: "v1", quantity: 2 },
      { product: "p1", variant: "v2", quantity: 3 },
    ]);
  });

  it("should leave variant-only lines unchanged", () => {
    expect(
      collapseGhostVariantCartLines([{ product: "p1", variant: "v1", quantity: 2 }]),
    ).toEqual([{ product: "p1", variant: "v1", quantity: 2 }]);
  });
});
