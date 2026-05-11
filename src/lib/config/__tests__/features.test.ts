import { afterEach, describe, expect, it, vi } from "vitest";

describe("features config", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("reads feature flags from env", async () => {
    process.env.NEXT_PUBLIC_MULTIVENDOR_ENABLED = "true";
    process.env.NEXT_PUBLIC_GUEST_CHECKOUT_ENABLED = "false";
    process.env.NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED = "true";

    vi.resetModules();
    const { features } = await import("@/lib/config/features");
    expect(features.multivendor).toBe(true);
    expect(features.guestCheckout).toBe(false);
    expect(features.socialLogin).toBe(true);
  });

  it("uses defaults when env vars are unset", async () => {
    delete process.env.NEXT_PUBLIC_MULTIVENDOR_ENABLED;
    delete process.env.NEXT_PUBLIC_GUEST_CHECKOUT_ENABLED;
    delete process.env.NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED;

    vi.resetModules();
    const mod = await import("@/lib/config/features");
    expect(mod.features.multivendor).toBe(false);
    expect(mod.features.guestCheckout).toBe(true);
    expect(mod.features.socialLogin).toBe(true);
  });

  it("should enable PLP stock badges only when NEXT_PUBLIC_PRODUCT_CARD_STOCK_BADGES_ON_CARDS is true", async () => {
    process.env.NEXT_PUBLIC_PRODUCT_CARD_STOCK_BADGES_ON_CARDS = "true";
    vi.resetModules();
    const mod = await import("@/lib/config/features");
    expect(mod.features.productCardStockBadgesOnCards).toBe(true);

    process.env.NEXT_PUBLIC_PRODUCT_CARD_STOCK_BADGES_ON_CARDS = "false";
    vi.resetModules();
    const mod2 = await import("@/lib/config/features");
    expect(mod2.features.productCardStockBadgesOnCards).toBe(false);
  });

  it("parses NEXT_PUBLIC_CART_URGENCY_COUNTDOWN_MINUTES when set", async () => {
    process.env.NEXT_PUBLIC_CART_URGENCY_COUNTDOWN_MINUTES = "45";
    vi.resetModules();
    const mod = await import("@/lib/config/features");
    expect(mod.features.cartUrgencyCountdownMinutes).toBe(45);

    delete process.env.NEXT_PUBLIC_CART_URGENCY_COUNTDOWN_MINUTES;
    vi.resetModules();
    const mod2 = await import("@/lib/config/features");
    expect(mod2.features.cartUrgencyCountdownMinutes).toBe(0);
  });

  it("parses PDP gallery mobile arrows env", async () => {
    delete process.env.NEXT_PUBLIC_PDP_GALLERY_MOBILE_ARROWS;
    vi.resetModules();
    let mod = await import("@/lib/config/features");
    expect(mod.features.pdpGalleryMobileArrows).toBe(true);

    process.env.NEXT_PUBLIC_PDP_GALLERY_MOBILE_ARROWS = "false";
    vi.resetModules();
    mod = await import("@/lib/config/features");
    expect(mod.features.pdpGalleryMobileArrows).toBe(false);

    process.env.NEXT_PUBLIC_PDP_GALLERY_MOBILE_ARROWS = "hidden";
    vi.resetModules();
    mod = await import("@/lib/config/features");
    expect(mod.features.pdpGalleryMobileArrows).toBe(false);
  });

  it("parses PDP description default open env", async () => {
    delete process.env.NEXT_PUBLIC_PDP_DESCRIPTION_DEFAULT_OPEN;
    vi.resetModules();
    let mod = await import("@/lib/config/features");
    expect(mod.features.pdpDescriptionDefaultOpen).toBe(false);

    process.env.NEXT_PUBLIC_PDP_DESCRIPTION_DEFAULT_OPEN = "open";
    vi.resetModules();
    mod = await import("@/lib/config/features");
    expect(mod.features.pdpDescriptionDefaultOpen).toBe(true);

    process.env.NEXT_PUBLIC_PDP_DESCRIPTION_DEFAULT_OPEN = "true";
    vi.resetModules();
    mod = await import("@/lib/config/features");
    expect(mod.features.pdpDescriptionDefaultOpen).toBe(true);
  });
});
