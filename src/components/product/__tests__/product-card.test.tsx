import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** Mutable mock — ProductCard reads `features` by reference. */
const featureFlags = vi.hoisted(() => ({
  multivendor: false,
  quickViewEnabled: false,
  productCompareEnabled: false,
  listingProductCardClick: "pdp" as "pdp" | "quickview",
}));

vi.mock("@/lib/config/features", () => ({
  features: featureFlags,
}));

vi.mock("next/image", () => ({
  default: () => null,
}));

vi.mock("@/components/product/add-to-cart-button", () => ({
  AddToCartButton: () => <button type="button">Add</button>,
}));

import { ProductCard } from "@/components/product/product-card";

const baseProduct = {
  id: "p1",
  name: "Test Product",
  slug: "test-product",
  basePrice: 10,
  currency: "USD",
  compareAtPrice: 12,
  images: [{ id: "img1", url: "/x.png", alt: "Product image" }],
  tenant: { id: "t1", name: "Vendor One", slug: "vendor-one" },
} as const;

describe("ProductCard", () => {
  beforeEach(() => {
    featureFlags.multivendor = false;
    featureFlags.quickViewEnabled = false;
    featureFlags.productCompareEnabled = false;
    featureFlags.listingProductCardClick = "pdp";
  });

  it("renders product name and price", () => {
    render(<ProductCard product={baseProduct as never} locale="en" />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText(/\$10\.00/)).toBeInTheDocument();
  });

  it("shows vendor badge when multivendor is enabled", () => {
    featureFlags.multivendor = true;

    render(<ProductCard product={baseProduct as never} locale="en" />);

    expect(screen.getByRole("link", { name: /vendor one/i })).toBeInTheDocument();
  });

  it("hides vendor badge when multivendor is disabled", () => {
    render(<ProductCard product={baseProduct as never} locale="en" />);

    expect(screen.queryByRole("link", { name: /vendor one/i })).not.toBeInTheDocument();
  });
});
