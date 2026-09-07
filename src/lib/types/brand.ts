import type { Media } from './product'

export interface Brand {
  id: string
  name: string
  label?: string
  slug: string
  description?: string | null
  logo?: Media | string | null
  bannerImage?: Media | string | null
  website?: string | null
  featured?: boolean
  displayOrder?: number
  meta?: {
    title?: string | null
    description?: string | null
    image?: Media | string | null
  } | null
  properties?: Array<{
    propertyKey: string
    propertyValue: string
  }> | null
  createdAt?: string
  updatedAt?: string
}

export interface BrandSummary {
  id: string
  name: string
  label?: string
  slug: string
  description?: string | null
  logoUrl?: string | null
  bannerUrl?: string | null
  website?: string | null
  productCount?: number
  featured?: boolean
}
