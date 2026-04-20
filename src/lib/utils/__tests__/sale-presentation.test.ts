import { describe, expect, it } from "vitest";
import {
  resolveEffectiveSaleMode,
  resolveSalePresentation,
} from "@/lib/utils/sale-presentation";

describe("resolveEffectiveSaleMode", () => {
  it("defaults product to strike_through when missing", () => {
    expect(resolveEffectiveSaleMode(undefined, undefined)).toBe("strike_through");
    expect(resolveEffectiveSaleMode(null, "inherit")).toBe("strike_through");
  });

  it("uses variant mode when not inherit", () => {
    expect(resolveEffectiveSaleMode("badge_percent", "none")).toBe("none");
    expect(resolveEffectiveSaleMode("none", "badge_amount")).toBe("badge_amount");
  });

  it("inherits product mode for inherit or null variant", () => {
    expect(resolveEffectiveSaleMode("badge_percent", "inherit")).toBe("badge_percent");
    expect(resolveEffectiveSaleMode("badge_percent", undefined)).toBe("badge_percent");
  });
});

describe("resolveSalePresentation", () => {
  const base = { sellingPrice: 90, compareAtPrice: 100 as number | null };

  it("treats no discount as no sale UI", () => {
    const p = resolveSalePresentation({
      sellingPrice: 100,
      compareAtPrice: 100,
      productSaleDisplayMode: "strike_through",
    });
    expect(p.isOnSale).toBe(false);
    expect(p.showStrike).toBe(false);
  });

  it("none hides strike and badges when on sale", () => {
    const p = resolveSalePresentation({ ...base, productSaleDisplayMode: "none" });
    expect(p.isOnSale).toBe(true);
    expect(p.showStrike).toBe(false);
    expect(p.showBadgePercent).toBe(false);
    expect(p.showBadgeAmount).toBe(false);
    expect(p.savingsAmount).toBe(10);
  });

  it("strike_through shows strike only", () => {
    const p = resolveSalePresentation({ ...base, productSaleDisplayMode: "strike_through" });
    expect(p.showStrike).toBe(true);
    expect(p.showBadgePercent).toBe(false);
    expect(p.showBadgeAmount).toBe(false);
  });

  it("badge_percent shows percent badge only", () => {
    const p = resolveSalePresentation({ ...base, productSaleDisplayMode: "badge_percent" });
    expect(p.showStrike).toBe(false);
    expect(p.showBadgePercent).toBe(true);
    expect(p.savingsPercent).toBe(10);
  });

  it("badge_amount shows amount badge only", () => {
    const p = resolveSalePresentation({ ...base, productSaleDisplayMode: "badge_amount" });
    expect(p.showBadgeAmount).toBe(true);
    expect(p.showStrike).toBe(false);
  });

  it("strike_and_badge shows strike and percent badge", () => {
    const p = resolveSalePresentation({ ...base, productSaleDisplayMode: "strike_and_badge" });
    expect(p.showStrike).toBe(true);
    expect(p.showBadgePercent).toBe(true);
    expect(p.showBadgeAmount).toBe(false);
  });

  it("respects variant override", () => {
    const p = resolveSalePresentation({
      ...base,
      productSaleDisplayMode: "strike_through",
      variantSaleDisplayMode: "none",
    });
    expect(p.showStrike).toBe(false);
  });
});
