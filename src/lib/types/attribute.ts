export type AttributeType =
  | 'specification'
  | 'series'
  | 'feature'
  | 'material'
  | 'connectivity'
  | 'compatibility'
  | 'certification'
  | 'custom'
  | string

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
  customType?: string | null
  slug: string
  description?: string | null
  featured?: boolean
  displayOrder?: number
  properties?: DynamicProperty[] | null
  createdAt?: string
  updatedAt?: string
}
