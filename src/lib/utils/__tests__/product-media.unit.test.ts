import { describe, expect, it } from "vitest";
import { getProductGalleryMedia, getProductMedia } from "../product-media";
import type { Media } from "@/lib/types/product";

function img(id: string, url: string): Media {
  return {
    id,
    url,
    alt: "",
    caption: null,
    width: 100,
    height: 100,
    mimeType: "image/jpeg",
    filesize: 1000,
  };
}

describe("getProductGalleryMedia", () => {
  it("returns product images only when variant has no image", () => {
    const a = img("1", "https://api.example/media/a.jpg");
    const b = img("2", "https://api.example/media/b.jpg");
    expect(getProductGalleryMedia([a, b], null)).toEqual([a, b]);
    expect(getProductGalleryMedia([a, b], undefined)).toEqual([a, b]);
  });

  it("prepends variant image and drops duplicate id from product gallery", () => {
    const shared = img("v1", "https://api.example/media/var.jpg");
    const other = img("2", "https://api.example/media/p.jpg");
    expect(getProductGalleryMedia([shared, other], shared)).toEqual([shared, other]);
  });

  it("prepends variant-specific image before product images", () => {
    const v = img("v", "https://api.example/media/v.jpg");
    const p = img("p", "https://api.example/media/p.jpg");
    expect(getProductGalleryMedia([p], v)).toEqual([v, p]);
  });

  it("handles Payload-style nested image rows", () => {
    const m = img("x", "https://api.example/media/x.jpg");
    expect(getProductGalleryMedia([{ image: m }], null)).toEqual(getProductMedia([{ image: m }]));
  });
});
