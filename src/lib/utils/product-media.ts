import type { Media } from "@/lib/types/product";

type ProductImageLike =
  | Media
  | {
      image?: Media | string | null;
    }
  | null
  | undefined;

function isMedia(value: unknown): value is Media {
  return Boolean(
    value &&
      typeof value === "object" &&
      "url" in value &&
      typeof (value as { url?: unknown }).url === "string",
  );
}

export function extractMedia(image: ProductImageLike): Media | null {
  if (!image) {
    return null;
  }

  if (isMedia(image)) {
    return image;
  }

  if (typeof image === "object" && "image" in image && isMedia(image.image)) {
    return image.image;
  }

  return null;
}

export function getProductMedia(images: ProductImageLike[] | null | undefined): Media[] {
  if (!images || !Array.isArray(images)) {
    return [];
  }

  return images
    .map((entry) => extractMedia(entry))
    .filter((entry): entry is Media => Boolean(entry?.url));
}
