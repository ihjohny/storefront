import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/utils/format-price";

describe("formatPrice", () => {
  it("formats USD with 2 decimals", () => {
    expect(formatPrice(12.5, "USD")).toContain("12.50");
  });

  it("formats BDT with 0 decimals", () => {
    const value = formatPrice(1250.45, "BDT");
    expect(value).toContain("১,২৫০");
  });

  it("handles 0, negative, and large numbers", () => {
    expect(formatPrice(0, "USD")).toContain("0.00");
    expect(formatPrice(-12, "USD")).toContain("12.00");
    expect(formatPrice(1000000, "USD")).toContain("1,000,000.00");
  });
});
