import { apiClient } from "./client";

type NextFetchOptions = {
  revalidate?: number;
  tags?: string[];
};

type GlobalRequestOptions = {
  next?: NextFetchOptions;
};

function buildGlobalPath(globalName: "header" | "footer", locale: string) {
  const params = new URLSearchParams({
    locale,
    depth: "1",
  });

  return `/globals/${globalName}?${params.toString()}`;
}

export async function getHeader(
  locale: string,
  options: GlobalRequestOptions = {},
) {
  try {
    return await apiClient<Record<string, unknown>>(buildGlobalPath("header", locale), {
      next: { revalidate: 60, ...options.next },
    } as RequestInit);
  } catch {
    return null;
  }
}

export async function getFooter(
  locale: string,
  options: GlobalRequestOptions = {},
) {
  try {
    return await apiClient<Record<string, unknown>>(buildGlobalPath("footer", locale), {
      next: { revalidate: 60, ...options.next },
    } as RequestInit);
  } catch {
    return null;
  }
}
