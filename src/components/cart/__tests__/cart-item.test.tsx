import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CartItem } from "@/components/cart/cart-item";

vi.mock("next/image", () => ({
  default: () => null,
}));

const item = {
  product: {
    id: "p1",
    name: "Sample Product",
    slug: "sample-product",
    images: [{ id: "m1", url: "/sample.png", alt: "sample image" }],
  },
  variant: {
    id: "v1",
    name: "Blue / M",
    sku: "SKU-1",
    options: [],
    image: null,
  },
  quantity: 2,
  unitPrice: 15,
} as const;

describe("CartItem", () => {
  it("renders item data", () => {
    render(
      <CartItem
        locale="en"
        item={item as never}
        onIncrease={() => {}}
        onDecrease={() => {}}
        onRemove={() => {}}
      />,
    );

    expect(screen.getByText("Sample Product")).toBeInTheDocument();
    expect(screen.getByText("Blue / M")).toBeInTheDocument();
    expect(screen.getByText(/\$30\.00/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sample Product" })).toHaveAttribute(
      "href",
      "/en/products/sample-product?variant=v1",
    );
  });

  it("handles quantity controls and remove action", async () => {
    const user = userEvent.setup();
    const onIncrease = vi.fn();
    const onDecrease = vi.fn();
    const onRemove = vi.fn();

    render(
      <CartItem
        locale="en"
        item={item as never}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
        onRemove={onRemove}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    await user.click(screen.getByRole("button", { name: "Decrease quantity" }));
    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(onIncrease).toHaveBeenCalledTimes(1);
    expect(onDecrease).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
