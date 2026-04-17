/**
 * Shared Login + Register field styles (theme tokens — no hard-coded slate).
 */
export const authFieldClass =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-card-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring";

export const authLabelClass = "text-sm font-medium text-foreground";

export const authPrimaryButtonClass =
  "w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

/** Primary CTA, inline (e.g. verify-email success). */
export const authPrimaryButtonInlineClass =
  "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Outline / secondary (e.g. resend verification). */
export const authOutlineButtonClass =
  "inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const authErrorClass = "text-sm text-destructive";

export const authInlineLinkClass =
  "font-medium text-primary underline underline-offset-4 hover:text-primary/90";

export const authFooterLinkClass =
  "text-sm text-muted-foreground transition hover:text-foreground hover:underline";

export const authSocialButtonClass =
  "rounded-md border border-border bg-card px-3 py-2 text-center text-sm font-medium text-card-foreground shadow-sm transition hover:bg-muted";
