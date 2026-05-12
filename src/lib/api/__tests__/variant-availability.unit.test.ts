import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as clientModule from "../client";
import { getVariantAvailability } from "../variant-availability";

describe("getVariantAvailability", () => {
  beforeEach(() => {
    vi.spyOn(clientModule, "apiClient").mockImplementation(async () => ({
      inventoryEnabled: true,
      productId: "p-remote",
      storeLocationId: null,
      lines: [{ variantId: "v1", purchasable: true }],
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return API payload when request succeeds", async () => {
    const r = await getVariantAvailability({ productId: "p1" });
    expect(r.inventoryEnabled).toBe(true);
    expect(r.productId).toBe("p-remote");
    expect(r.lines).toHaveLength(1);
    expect(clientModule.apiClient).toHaveBeenCalledWith(
      "/storefront/variant-availability?product=p1",
    );
  });

  it("should include store in query when storeLocationId is set", async () => {
    await getVariantAvailability({ productId: "p1", storeLocationId: "store-a" });
    expect(clientModule.apiClient).toHaveBeenCalledWith(
      "/storefront/variant-availability?product=p1&store=store-a",
    );
  });

  it("should synthesize inventoryDisabled shape when api returns 404", async () => {
    vi.spyOn(clientModule, "apiClient").mockRejectedValue(
      new clientModule.ApiError("nf", 404, { error: "Not found" }),
    );
    const r = await getVariantAvailability({
      productId: "p1",
      storeLocationId: "loc-z",
    });
    expect(r).toEqual({
      inventoryEnabled: false,
      productId: "p1",
      storeLocationId: "loc-z",
      lines: [],
    });
  });

  it("should rethrow non-404 ApiError", async () => {
    vi.spyOn(clientModule, "apiClient").mockRejectedValue(
      new clientModule.ApiError("server", 500, {}),
    );
    await expect(getVariantAvailability({ productId: "p1" })).rejects.toMatchObject({
      status: 500,
    });
  });
});
