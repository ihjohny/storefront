export type AttributeDataType =
  | 'select'
  | 'multiselect'
  | 'text'
  | 'number'
  | 'boolean'
  | 'color'

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

export interface AttributeOption {
  id?: string
  value: string
  label: string | Record<string, string>
  hexColor?: string | null
}

export interface Attribute {
  id: string
  key: string
  label: string | Record<string, string>
  slug: string
  dataType?: AttributeDataType
  category?: AttributeType
  type?: AttributeType
  unit?: string | null
  defaultGroup?: string | null
  options?: AttributeOption[] | null
  isFilterable?: boolean
  isComparable?: boolean
  featured?: boolean
  displayOrder?: number
  description?: string | null
  createdAt?: string
  updatedAt?: string
}

