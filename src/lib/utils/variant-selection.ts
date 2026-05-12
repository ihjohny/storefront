import type { ProductVariant } from "@/lib/types/product";

export type VariantOptionMap = Record<string, string>;

export function variantToOptionMap(variant: ProductVariant): VariantOptionMap {
  return variant.options.reduce<VariantOptionMap>((acc, option) => {
    acc[option.name] = option.value;
    return acc;
  }, {});
}

/** Initial `<select>` state from optional `?variant=` deep-link (e.g. cart → PDP). */
export function initialVariantOptionMap(args: {
  variants: ProductVariant[];
  initialVariantId?: string | null;
}): VariantOptionMap {
  const { variants, initialVariantId } = args;
  const first = variants[0];
  if (!first) {
    return {};
  }
  const trimmed = initialVariantId != null ? String(initialVariantId).trim() : "";
  if (trimmed.length > 0) {
    const match = variants.find((v) => String(v.id) === trimmed);
    if (match) {
      return variantToOptionMap(match);
    }
  }
  return variantToOptionMap(first);
}

/**
 * When the shopper changes one option dimension, produce a full option map that matches a real variant.
 * - Prefer an exact match for the tentative cartesian selection.
 * - Else prefer the first variant (stable id sort) that includes the chosen axis value.
 * - Else fall back to the first variant.
 */
export function resolveVariantOptionMapAfterChange(args: {
  variants: ProductVariant[];
  optionNames: string[];
  selectedOptions: VariantOptionMap;
  changedName: string;
  changedValue: string;
}): VariantOptionMap {
  const { variants, optionNames, selectedOptions, changedName, changedValue } = args;
  if (variants.length === 0) {
    return {};
  }

  const tentative = { ...selectedOptions, [changedName]: changedValue };

  const exact = variants.find((v) =>
    optionNames.every((n) => variantToOptionMap(v)[n] === tentative[n]),
  );
  if (exact) {
    return variantToOptionMap(exact);
  }

  const withAxis = variants
    .filter((v) => variantToOptionMap(v)[changedName] === changedValue)
    .sort((a, b) => a.id.localeCompare(b.id));

  if (withAxis.length > 0) {
    return variantToOptionMap(withAxis[0]!);
  }

  return variantToOptionMap(variants[0]!);
}
