import type { Attribute } from '@/lib/types/attribute'
import type { Brand } from '@/lib/types/brand'

type HasBrandAndAttributes = {
  brand?: Brand | string | null
  attributes?: Array<Attribute | string> | null
}

export function getProductBrand(product: HasBrandAndAttributes | null | undefined): Brand | null {
  if (!product) return null
  if (product.brand && typeof product.brand === 'object' && 'name' in product.brand) {
    return product.brand as Brand
  }
  return null
}

export function getProductSeries(product: HasBrandAndAttributes | null | undefined): Attribute | null {
  if (!product || !Array.isArray(product.attributes)) return null
  for (const attr of product.attributes) {
    if (typeof attr === 'object' && attr !== null && attr.type === 'series') {
      return attr
    }
  }
  return null
}

export function getProductAttributes(product: HasBrandAndAttributes | null | undefined): Attribute[] {
  if (!product || !Array.isArray(product.attributes)) return []
  return product.attributes.filter(
    (attr): attr is Attribute => typeof attr === 'object' && attr !== null,
  )
}
