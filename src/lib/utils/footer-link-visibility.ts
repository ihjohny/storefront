export type FooterLinkVisibility = "public" | "guest" | "authenticated";

/** Parse API/CMS value; unknown or missing → public. */
export function parseFooterLinkVisibility(raw: unknown): FooterLinkVisibility {
  if (raw === "guest" || raw === "authenticated") return raw;
  return "public";
}

export function shouldShowFooterLink(
  visibility: FooterLinkVisibility,
  isAuthenticated: boolean,
): boolean {
  if (visibility === "public") return true;
  if (visibility === "guest") return !isAuthenticated;
  return isAuthenticated;
}
