import { describe, expect, it } from "vitest";
import { createCart, deleteCart, getCart, updateCart } from "../cart";

describe("cart API helpers", () => {
  it("getCart returns null when neither user nor guest id is provided", async () => {
    await expect(getCart(undefined, undefined)).resolves.toBeNull();
  });

  it("getCart returns a cart for guestId", async () => {
    const cart = await getCart(undefined, "guest-test-uuid");
    expect(cart).not.toBeNull();
    expect(cart?.id).toBe("cart-msw-1");
    expect(cart?.items?.length).toBeGreaterThan(0);
  });

  it("createCart posts items and returns doc", async () => {
    const cart = await createCart([{ product: "p1", quantity: 2 }], "guest-1");
    expect(cart.id).toBe("cart-new");
  });

  it("updateCart patches cart", async () => {
    const cart = await updateCart("cart-msw-1", [{ product: "p1", quantity: 3 }], "guest-1");
    expect(cart).toBeDefined();
  });

  it("deleteCart resolves without throwing", async () => {
    await expect(deleteCart("cart-msw-1", "guest-1")).resolves.toBeUndefined();
  });
});
