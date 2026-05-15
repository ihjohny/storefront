import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/api-response";

export interface Address {
  id: string;
  user: string | null;
  label: string;
  firstName: string;
  lastName: string;
  street1: string;
  street2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  geoCountryId?: string | null;
  geoSubdivisionId?: string | null;
  geoLocalityId?: string | null;
  preferredStoreId?: string | null;
  phone: string | null;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, "id">;

type AddressListOptions = {
  page?: number;
  limit?: number;
};

export async function getAddressesPage(
  userId: string,
  options: AddressListOptions = {},
): Promise<PaginatedResponse<Address>> {
  const params = new URLSearchParams();
  params.set("where[user][equals]", userId);
  params.set("limit", String(options.limit ?? 50));
  params.set("page", String(options.page ?? 1));

  return apiClient<PaginatedResponse<Address>>(`/addresses?${params.toString()}`);
}

export async function getAddresses(userId: string): Promise<Address[]> {
  const response = await getAddressesPage(userId, { page: 1, limit: 50 });
  return response.docs;
}

export async function createAddress(data: AddressInput): Promise<Address> {
  const response = await apiClient<{ doc: Address }>("/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.doc;
}

export async function updateAddress(
  id: string,
  data: Partial<AddressInput>,
): Promise<Address> {
  const response = await apiClient<{ doc: Address }>(`/addresses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return response.doc;
}

export async function deleteAddress(id: string): Promise<void> {
  await apiClient(`/addresses/${id}`, {
    method: "DELETE",
  });
}
