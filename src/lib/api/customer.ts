import { apiClient } from './client'
import type { Product } from '../types/product'

export interface CustomerDeviceRecord {
  orderNumber?: string
  deviceType?: string
  browser?: string
  os?: string
  ipAddress?: string
  placedAt?: string
}

export interface CustomerAnalytics {
  totalOrders: number
  totalSpent: number
  currency: string
  lastOrderDate?: string
  favoriteBrands?: string[]
  favoriteCategories?: string[]
  devices: CustomerDeviceRecord[]
}

export async function getCustomerRecommendations(options: {
  locale?: string
  limit?: number
  cookieHeader?: string
} = {}): Promise<Product[]> {
  try {
    const params = new URLSearchParams()
    if (options.locale) params.set('locale', options.locale)
    if (options.limit) params.set('limit', String(options.limit))

    const response = await apiClient<{ docs?: Product[] }>(
      `/customer/recommendations?${params.toString()}`,
      {
        headers: options.cookieHeader ? { Cookie: options.cookieHeader } : undefined,
        next: { revalidate: 60 },
      } as RequestInit,
    )

    return response.docs ?? []
  } catch (err) {
    console.error('[getCustomerRecommendations]', err)
    return []
  }
}

export async function getCustomerAnalytics(cookieHeader?: string): Promise<CustomerAnalytics | null> {
  try {
    const response = await apiClient<{
      authenticated: boolean
      metrics?: {
        totalOrders?: number
        totalSpent?: number
        currency?: string
        lastOrderDate?: string
      }
      favoriteBrands?: string[]
      favoriteCategories?: string[]
      recentDevices?: CustomerDeviceRecord[]
    }>('/customer/analytics', {
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
      cache: 'no-store',
    } as RequestInit)

    if (!response || !response.metrics) return null

    return {
      totalOrders: response.metrics.totalOrders ?? 0,
      totalSpent: response.metrics.totalSpent ?? 0,
      currency: response.metrics.currency ?? 'USD',
      lastOrderDate: response.metrics.lastOrderDate,
      favoriteBrands: response.favoriteBrands ?? [],
      favoriteCategories: response.favoriteCategories ?? [],
      devices: response.recentDevices ?? [],
    }
  } catch (err) {
    console.error('[getCustomerAnalytics]', err)
    return null
  }
}
