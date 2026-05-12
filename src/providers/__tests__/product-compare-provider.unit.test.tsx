import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MAX_PRODUCT_COMPARE_ITEMS,
  PRODUCT_COMPARE_STORAGE_KEY,
} from "@/lib/product-compare/constants";
import { ProductCompareProvider, useProductCompare } from "@/providers/product-compare-provider";

function Probe() {
  const { entries, hydrated, toggleEntry } = useProductCompare();
  return (
    <>
      <span data-testid="hydrated">{String(hydrated)}</span>
      <span data-testid="count">{entries.length}</span>
      <span data-testid="first">
        {entries[0] ? `${entries[0].productId}:${entries[0].variantId ?? ""}` : ""}
      </span>
      <button type="button" onClick={() => toggleEntry("p-a", null)}>
        toggle-p-a
      </button>
      <button type="button" onClick={() => toggleEntry("p-a", "v1")}>
        toggle-p-a-v1
      </button>
      {Array.from({ length: MAX_PRODUCT_COMPARE_ITEMS }, (_, i) => (
        <button key={i} type="button" onClick={() => toggleEntry(`fill-${i}`, null)}>
          fill-{i}
        </button>
      ))}
    </>
  );
}

async function waitHydrated() {
  await waitFor(() => expect(screen.getByTestId("hydrated")).toHaveTextContent("true"));
}

describe("ProductCompareProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should hydrate legacy string[] storage as product-only lines", async () => {
    localStorage.setItem(PRODUCT_COMPARE_STORAGE_KEY, JSON.stringify(["x", "y"]));
    render(
      <ProductCompareProvider>
        <Probe />
      </ProductCompareProvider>,
    );
    await waitHydrated();
    expect(screen.getByTestId("count")).toHaveTextContent("2");
    expect(screen.getByTestId("first")).toHaveTextContent("x:");
  });

  it("should persist object-shaped entries after toggle", async () => {
    const user = userEvent.setup();
    render(
      <ProductCompareProvider>
        <Probe />
      </ProductCompareProvider>,
    );
    await waitHydrated();
    await user.click(screen.getByRole("button", { name: "toggle-p-a-v1" }));
    expect(screen.getByTestId("first")).toHaveTextContent("p-a:v1");
    const stored = JSON.parse(localStorage.getItem(PRODUCT_COMPARE_STORAGE_KEY)!);
    expect(Array.isArray(stored)).toBe(true);
    expect(stored[0]).toEqual({ productId: "p-a", variantId: "v1" });
  });

  it("should not grow beyond MAX_PRODUCT_COMPARE_ITEMS when adding another product", async () => {
    const user = userEvent.setup();
    render(
      <ProductCompareProvider>
        <Probe />
      </ProductCompareProvider>,
    );
    await waitHydrated();
    for (let i = 0; i < MAX_PRODUCT_COMPARE_ITEMS; i++) {
      await user.click(screen.getByRole("button", { name: `fill-${i}` }));
    }
    expect(screen.getByTestId("count")).toHaveTextContent(String(MAX_PRODUCT_COMPARE_ITEMS));
    await user.click(screen.getByRole("button", { name: "toggle-p-a" }));
    expect(screen.getByTestId("count")).toHaveTextContent(String(MAX_PRODUCT_COMPARE_ITEMS));
  });
});
