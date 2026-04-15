import { apiClient } from "./client";
import type {
  DeliveryContextResponse,
  GeoCountryListItem,
  GeoLocalityListItem,
  GeoSubdivisionListItem,
} from "../types/geography";

type ListResponse<T> = { docs: T[] };

export type GeoFetchOptions = {
  onlyWithPublicStoreCoverage?: boolean;
};

export async function fetchGeoCountries(): Promise<GeoCountryListItem[]> {
  const params = new URLSearchParams();
  params.set("resource", "countries");
  const res = await apiClient<ListResponse<GeoCountryListItem>>(
    `/storefront/geography?${params.toString()}`,
    { next: { revalidate: 3600 } } as RequestInit,
  );
  return res.docs;
}

export async function fetchGeoSubdivisions(
  countryId: string,
  opts?: GeoFetchOptions,
): Promise<GeoSubdivisionListItem[]> {
  const params = new URLSearchParams();
  params.set("resource", "subdivisions");
  params.set("countryId", countryId);
  if (opts?.onlyWithPublicStoreCoverage) {
    params.set("onlyWithPublicStoreCoverage", "true");
  }
  const res = await apiClient<ListResponse<GeoSubdivisionListItem>>(
    `/storefront/geography?${params.toString()}`,
    { next: { revalidate: 600 } } as RequestInit,
  );
  return res.docs;
}

export async function fetchGeoLocalities(
  subdivisionId: string,
  opts?: GeoFetchOptions,
): Promise<GeoLocalityListItem[]> {
  const params = new URLSearchParams();
  params.set("resource", "localities");
  params.set("subdivisionId", subdivisionId);
  if (opts?.onlyWithPublicStoreCoverage) {
    params.set("onlyWithPublicStoreCoverage", "true");
  }
  const res = await apiClient<ListResponse<GeoLocalityListItem>>(
    `/storefront/geography?${params.toString()}`,
    { next: { revalidate: 600 } } as RequestInit,
  );
  return res.docs;
}

export async function fetchDeliveryContext(
  subdivisionId: string,
  localityId: string | null,
): Promise<DeliveryContextResponse> {
  const params = new URLSearchParams();
  params.set("resource", "delivery-context");
  params.set("subdivisionId", subdivisionId);
  if (localityId) params.set("localityId", localityId);
  return apiClient<DeliveryContextResponse>(
    `/storefront/geography?${params.toString()}`,
    { cache: "no-store" } as RequestInit,
  );
}
