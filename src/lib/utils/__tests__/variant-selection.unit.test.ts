import { describe, expect, it } from "vitest";
import {
  initialVariantOptionMap,
  resolveVariantOptionMapAfterChange,
  variantToOptionMap,
} from "@/lib/utils/variant-selection";
import type { ProductVariant } from "@/lib/types/product";

function v(
  id: string,
  opts: { name: string; value: string }[],
): ProductVariant {
  return {
    id,
    product: "prod",
    name: id,
    sku: id,
    price: 1,
    compareAtPrice: null,
    image: null,
    options: opts,
    isActive: true,
  };
}

describe("initialVariantOptionMap", () => {
  it("should select variant matching deep-link id", () => {
    const variants = [
      v("first", [{ name: "Color", value: "Red" }]),
      v("second", [{ name: "Color", value: "Blue" }]),
    ];
    expect(initialVariantOptionMap({ variants, initialVariantId: "second" })).toEqual({
      Color: "Blue",
    });
  });

  it("should fall back to first variant when id unknown", () => {
    const variants = [
      v("first", [{ name: "Color", value: "Red" }]),
      v("second", [{ name: "Color", value: "Blue" }]),
    ];
    expect(initialVariantOptionMap({ variants, initialVariantId: "nope" })).toEqual({
      Color: "Red",
    });
  });
});

describe("resolveVariantOptionMapAfterChange", () => {
  it("should keep all selects aligned when the new combo exists", () => {
    const variants = [
      v("a", [
        { name: "Color", value: "Red" },
        { name: "Size", value: "M" },
      ]),
      v("b", [
        { name: "Color", value: "Red" },
        { name: "Size", value: "L" },
      ]),
      v("c", [
        { name: "Color", value: "Blue" },
        { name: "Size", value: "M" },
      ]),
    ];
    const optionNames = ["Color", "Size"];
    const selected = variantToOptionMap(variants[0]!);

    const next = resolveVariantOptionMapAfterChange({
      variants,
      optionNames,
      selectedOptions: selected,
      changedName: "Size",
      changedValue: "L",
    });

    expect(next).toEqual({ Color: "Red", Size: "L" });
  });

  it("should snap to a valid variant when the tentative combo does not exist", () => {
    const variants = [
      v("a", [
        { name: "Color", value: "Red" },
        { name: "Size", value: "M" },
      ]),
      v("b", [
        { name: "Color", value: "Blue" },
        { name: "Size", value: "S" },
      ]),
    ];
    const optionNames = ["Color", "Size"];
    const selected = variantToOptionMap(variants[0]!);

    const next = resolveVariantOptionMapAfterChange({
      variants,
      optionNames,
      selectedOptions: selected,
      changedName: "Color",
      changedValue: "Blue",
    });

    expect(next).toEqual({ Color: "Blue", Size: "S" });
  });
});
