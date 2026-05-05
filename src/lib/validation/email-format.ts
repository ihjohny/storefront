/**
 * Lightweight email-shape check used across checkout guest fields and auth helpers.
 * Intentionally simple (not RFC 5322); trim/lowercase at call sites when needed.
 */
export const LOOSE_EMAIL_FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
