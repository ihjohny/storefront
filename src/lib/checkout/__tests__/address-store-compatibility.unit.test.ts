import { describe, expect, it } from "vitest";
import {
  isAddressCompatibleWithSelection,
  isAddressCompatibleWithServiceArea,
} from "../address-store-compatibility";

const addressBase = {
  id: "addr-1",
  user: "user-1",
  label: "Home",
  firstName: "A",
  lastName: "B",
  street1: "Road",
  street2: null,
  city: "Dhaka",
  state: "Dhaka",
  postalCode: "1200",
  country: "BD",
  phone: null,
  isDefault: false,
};

describe("address-store-compatibility", () => {
  it("matches service area when geo ids align", () => {
    expect(
      isAddressCompatibleWithServiceArea(
        {
          ...addressBase,
          geoCountryId: "country-1",
          geoSubdivisionId: "sub-1",
          geoLocalityId: "loc-1",
        },
        {
          countries: [{ id: "country-1", isoCode: "BD" }],
          selectedCountryId: "country-1",
          selectedSubdivisionId: "sub-1",
          selectedLocalityId: "loc-1",
        },
      ),
    ).toBe(true);
  });

  it("rejects service area mismatch", () => {
    expect(
      isAddressCompatibleWithServiceArea(
        { ...addressBase, geoCountryId: "country-2" },
        {
          countries: [{ id: "country-1", isoCode: "BD" }],
          selectedCountryId: "country-1",
          selectedSubdivisionId: "sub-1",
          selectedLocalityId: null,
        },
      ),
    ).toBe(false);
  });

  it("matches selection when preferred store and geo affinity align", () => {
    expect(
      isAddressCompatibleWithSelection(
        {
          ...addressBase,
          preferredStoreId: "store-1",
          geoSubdivisionId: "sub-1",
        },
        "store-1",
        {
          selectedCountryId: null,
          selectedSubdivisionId: "sub-1",
          selectedLocalityId: null,
        },
      ),
    ).toBe(true);
  });

  it("rejects selection when preferred store conflicts", () => {
    expect(
      isAddressCompatibleWithSelection(
        { ...addressBase, preferredStoreId: "store-2" },
        "store-1",
        {
          selectedCountryId: null,
          selectedSubdivisionId: null,
          selectedLocalityId: null,
        },
      ),
    ).toBe(false);
  });
});
