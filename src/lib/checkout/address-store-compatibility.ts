import type { Address } from "@/lib/api/addresses";

type ServiceAreaLike = {
  countries?: { id: string; isoCode: string }[];
  selectedCountryId: string | null;
  selectedSubdivisionId: string | null;
  selectedLocalityId: string | null;
};

function normalizeUpper(value: string | null | undefined): string {
  return (value ?? "").trim().toUpperCase();
}

export function isAddressCompatibleWithServiceArea(
  address: Address,
  serviceArea: ServiceAreaLike | undefined,
): boolean {
  if (!serviceArea?.selectedCountryId || !serviceArea.selectedSubdivisionId) {
    return true;
  }
  if (address.geoCountryId && address.geoCountryId !== serviceArea.selectedCountryId) {
    return false;
  }
  if (
    address.geoSubdivisionId &&
    address.geoSubdivisionId !== serviceArea.selectedSubdivisionId
  ) {
    return false;
  }
  if (
    serviceArea.selectedLocalityId &&
    address.geoLocalityId &&
    address.geoLocalityId !== serviceArea.selectedLocalityId
  ) {
    return false;
  }
  const selectedCountry = serviceArea.countries?.find(
    (entry) => entry.id === serviceArea.selectedCountryId,
  );
  if (
    selectedCountry &&
    normalizeUpper(address.country) &&
    normalizeUpper(address.country) !== normalizeUpper(selectedCountry.isoCode)
  ) {
    return false;
  }
  return true;
}

export function isAddressCompatibleWithSelection(
  address: Address,
  selectedStoreId?: string | null,
  serviceArea?: Pick<
    ServiceAreaLike,
    "selectedCountryId" | "selectedSubdivisionId" | "selectedLocalityId"
  >,
): boolean {
  if (
    selectedStoreId &&
    address.preferredStoreId &&
    address.preferredStoreId !== selectedStoreId
  ) {
    return false;
  }
  if (
    serviceArea?.selectedCountryId &&
    address.geoCountryId &&
    address.geoCountryId !== serviceArea.selectedCountryId
  ) {
    return false;
  }
  if (
    serviceArea?.selectedSubdivisionId &&
    address.geoSubdivisionId &&
    address.geoSubdivisionId !== serviceArea.selectedSubdivisionId
  ) {
    return false;
  }
  if (
    serviceArea?.selectedLocalityId &&
    address.geoLocalityId &&
    address.geoLocalityId !== serviceArea.selectedLocalityId
  ) {
    return false;
  }
  return true;
}
