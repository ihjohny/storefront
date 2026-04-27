import { cookies } from "next/headers";
import { features } from "@/lib/config/features";

const COOKIE_KEY = "bs-selected-store-id";

/**
 * Read the selected store ID from the cookie jar (Server Components only).
 * Returns `undefined` when multi-store is disabled or no store is selected.
 */
export async function getSelectedStoreId(): Promise<string | undefined> {
  if (!features.multiStore) return undefined;

  const jar = await cookies();
  const value = jar.get(COOKIE_KEY)?.value;
  return value ? decodeURIComponent(value) : undefined;
}
