import type { Media } from './product'

export type AttributeType =
  | 'brand'
  | 'manufacturer'
  | 'series'
  | 'material'
  | 'feature'
  | 'custom'

export interface DynamicProperty {
  id?: string
  propertyKey: string
  propertyValue: string
  propertyType?: 'text' | 'number' | 'boolean' | 'color'
}

export interface Attribute {
  id: string
  key: string
  label: string
  type: AttributeType
  slug: string
  description?: string | null
  logo?: Media | string | null
  website?: string | null
  featured?: boolean
  displayOrder?: number
  properties?: DynamicProperty[] | null
  createdAt?: string
  updatedAt?: string
}

export interface BrandSummary {
  id: string
  name: string
  slug: string
  description?: string | null
  logoUrl?: string | null
  website?: string | null
  productCount?: number
  featured?: boolean
}
