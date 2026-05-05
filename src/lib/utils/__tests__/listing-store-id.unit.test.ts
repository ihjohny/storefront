import { describe, expect, it } from "vitest";
import { resolveListingStoreId } from "../listing-store-id";

describe("resolveListingStoreId", () => {
  it("should return undefined when service-area listing is disabled", () => {
    expect(
      resolveListingStoreId({
        serviceAreaStoreSelection: false,
        selectedStockLocationId: "loc-1",
        inStockAtStoreParam: undefined,
      }),
    ).toBeUndefined();
  });

  it("should return undefined when shopper opted into full catalog", () => {
    expect(
      resolveListingStoreId({
        serviceAreaStoreSelection: true,
        selectedStockLocationId: "loc-1",
        inStockAtStoreParam: "0",
      }),
    ).toBeUndefined();
  });

  it("should return selected location when restricted listing is default", () => {
    expect(
      resolveListingStoreId({
        serviceAreaStoreSelection: true,
        selectedStockLocationId: "loc-1",
        inStockAtStoreParam: undefined,
      }),
    ).toBe("loc-1");
  });
});
