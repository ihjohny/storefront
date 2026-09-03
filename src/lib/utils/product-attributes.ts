import type { Attribute } from '@/lib/types/attribute'

type HasAttributes = {
  attributes?: Array<Attribute | string> | null
}

export function getProductBrand(product: HasAttributes | null | undefined): Attribute | null {
  if (!product || !Array.isArray(product.attributes)) return null
  for (const attr of product.attributes) {
    if (typeof attr === 'object' && attr !== null && attr.type === 'brand') {
      return attr
    }
  }
  return null
}

export function getProductSeries(product: HasAttributes | null | undefined): Attribute | null {
  if (!product || !Array.isArray(product.attributes)) return null
  for (const attr of product.attributes) {
    if (typeof attr === 'object' && attr !== null && attr.type === 'series') {
      return attr
    }
  }
  return null
}

export function getProductAttributes(product: HasAttributes | null | undefined): Attribute[] {
  if (!product || !Array.isArray(product.attributes)) return []
  return product.attributes.filter(
    (attr): attr is Attribute => typeof attr === 'object' && attr !== null,
  )
}
