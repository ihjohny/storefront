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
  phone: string | null;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, "id">;

export async function getAddresses(userId: string): Promise<Address[]> {
  const params = new URLSearchParams();
  params.set("where[user][equals]", userId);
  params.set("limit", "50");

  const response = await apiClient<PaginatedResponse<Address>>(
    `/addresses?${params.toString()}`,
  );
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
