/**
 * Mirrors backend AUTH_REQUIRED_IDENTIFIER — storefront uses NEXT_PUBLIC_AUTH_REQUIRED_IDENTIFIER.
 */
export type AuthRequiredIdentifierMode = "email" | "phone" | "either";

export function parseAuthRequiredIdentifier(
  raw: string | undefined,
): AuthRequiredIdentifierMode {
  const v = raw?.toLowerCase().trim();
  if (v === "email" || v === "phone" || v === "either") return v;
  return "either";
}
