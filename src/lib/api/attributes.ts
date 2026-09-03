import { apiClient } from './client'
import type { PaginatedResponse } from '../types/api-response'
import type { Attribute, AttributeType } from '../types/attribute'

interface GetAttributesOptions {
  type?: AttributeType
  featured?: boolean
  locale?: string
  limit?: number
}

export async function getAttributes(options: GetAttributesOptions = {}): Promise<Attribute[]> {
  try {
    const params = new URLSearchParams()
    params.set('limit', String(options.limit ?? 100))
    params.set('depth', '1')
    params.set('sort', 'displayOrder')

    if (options.locale) {
      params.set('locale', options.locale)
    }
    if (options.type) {
      params.set('where[type][equals]', options.type)
    }
    if (options.featured !== undefined) {
      params.set('where[featured][equals]', String(options.featured))
    }

    const response = await apiClient<PaginatedResponse<Attribute>>(
      `/attributes?${params.toString()}`,
      { next: { revalidate: 60 } } as RequestInit,
    )

    return response.docs ?? []
  } catch (err) {
    console.error('[getAttributes]', err)
    return []
  }
}

export async function getBrands(locale: string = 'en'): Promise<Attribute[]> {
  return getAttributes({ type: 'brand', locale })
}

export async function getFeaturedBrands(locale: string = 'en'): Promise<Attribute[]> {
  return getAttributes({ type: 'brand', featured: true, locale })
}

export async function getBrandBySlug(slug: string, locale: string = 'en'): Promise<Attribute | null> {
  try {
    const params = new URLSearchParams()
    params.set('where[type][equals]', 'brand')
    params.set('where[slug][equals]', slug)
    params.set('locale', locale)
    params.set('depth', '1')
    params.set('limit', '1')

    const response = await apiClient<PaginatedResponse<Attribute>>(
      `/attributes?${params.toString()}`,
      { next: { revalidate: 60 } } as RequestInit,
    )

    return response.docs?.[0] ?? null
  } catch (err) {
    console.error('[getBrandBySlug]', err)
    return null
  }
}

export async function getAttributeBySlug(slug: string, locale: string = 'en'): Promise<Attribute | null> {
  try {
    const params = new URLSearchParams()
    params.set('where[slug][equals]', slug)
    params.set('locale', locale)
    params.set('depth', '1')
    params.set('limit', '1')

    const response = await apiClient<PaginatedResponse<Attribute>>(
      `/attributes?${params.toString()}`,
      { next: { revalidate: 60 } } as RequestInit,
    )

    return response.docs?.[0] ?? null
  } catch (err) {
    console.error('[getAttributeBySlug]', err)
    return null
  }
}
