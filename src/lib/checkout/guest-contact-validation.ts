import type { AuthRequiredIdentifierMode } from "@/lib/auth/auth-required-identifier";
import { LOOSE_EMAIL_FORMAT_RE } from "@/lib/validation/email-format";

/** Throws Error with message suitable for UI when guest contact fails policy. */
export function assertGuestContactAllowed(
  mode: AuthRequiredIdentifierMode,
  guestEmail: string,
  guestPhone: string,
): void {
  const ge = guestEmail.trim().toLowerCase();
  const gp = guestPhone.trim();
  const emailOk = ge.length > 0 && LOOSE_EMAIL_FORMAT_RE.test(ge);
  const phoneOk = gp.length >= 5;

  if (mode === "email") {
    if (!emailOk) throw new Error("Guest checkout requires a valid email.");
    return;
  }
  if (mode === "phone") {
    if (!phoneOk) throw new Error("Guest checkout requires phone (at least 5 characters).");
    return;
  }
  if (!emailOk && !phoneOk) {
    throw new Error(
      "Guest checkout requires an email or a phone number (at least 5 characters).",
    );
  }
  if (ge.length > 0 && !emailOk) {
    throw new Error("Enter a valid email address.");
  }
  if (gp.length > 0 && gp.length < 5) {
    throw new Error("Phone must be at least 5 characters.");
  }
}
