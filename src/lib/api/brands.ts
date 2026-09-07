import { apiClient } from './client'
import type { PaginatedResponse } from '../types/api-response'
import type { Brand } from '../types/brand'

interface GetBrandsOptions {
  featured?: boolean
  locale?: string
  limit?: number
}

export async function getBrands(options: GetBrandsOptions = {}): Promise<Brand[]> {
  try {
    const params = new URLSearchParams()
    params.set('limit', String(options.limit ?? 100))
    params.set('depth', '1')
    params.set('sort', 'displayOrder')

    if (options.locale) {
      params.set('locale', options.locale)
    }
    if (options.featured !== undefined) {
      params.set('where[featured][equals]', String(options.featured))
    }

    const response = await apiClient<PaginatedResponse<Brand>>(
      `/brands?${params.toString()}`,
      { next: { revalidate: 60 } } as RequestInit,
    )

    return response.docs ?? []
  } catch (err) {
    console.error('[getBrands]', err)
    return []
  }
}

export async function getFeaturedBrands(locale: string = 'en'): Promise<Brand[]> {
  return getBrands({ featured: true, locale })
}

export async function getBrandBySlug(slug: string, locale: string = 'en'): Promise<Brand | null> {
  try {
    const params = new URLSearchParams()
    params.set('where[slug][equals]', slug)
    params.set('locale', locale)
    params.set('depth', '1')
    params.set('limit', '1')

    const response = await apiClient<PaginatedResponse<Brand>>(
      `/brands?${params.toString()}`,
      { next: { revalidate: 60 } } as RequestInit,
    )

    return response.docs?.[0] ?? null
  } catch (err) {
    console.error('[getBrandBySlug]', err)
    return null
  }
}
