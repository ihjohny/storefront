import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: () => null,
}));

vi.mock("@/components/product/add-to-cart-button", () => ({
  AddToCartButton: () => <button type="button">Add</button>,
}));

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
    vi.resetModules();
  });

  it("renders product name and price", async () => {
    vi.doMock("@/lib/config/features", () => ({
      features: { multivendor: false },
    }));
    const { ProductCard } = await import("@/components/product/product-card");

    render(<ProductCard product={baseProduct as never} locale="en" />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText(/\$10\.00/)).toBeInTheDocument();
  });

  it("shows vendor badge when multivendor is enabled", async () => {
    vi.doMock("@/lib/config/features", () => ({
      features: { multivendor: true },
    }));
    const { ProductCard } = await import("@/components/product/product-card");

    render(<ProductCard product={baseProduct as never} locale="en" />);

    expect(screen.getByRole("link", { name: /vendor one/i })).toBeInTheDocument();
  });

  it("hides vendor badge when multivendor is disabled", async () => {
    vi.doMock("@/lib/config/features", () => ({
      features: { multivendor: false },
    }));
    const { ProductCard } = await import("@/components/product/product-card");

    render(<ProductCard product={baseProduct as never} locale="en" />);

    expect(screen.queryByRole("link", { name: /vendor one/i })).not.toBeInTheDocument();
  });
});
