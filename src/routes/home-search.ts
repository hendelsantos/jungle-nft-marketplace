import type { NftSort } from '@/api/contracts'

export interface HomeSearch {
  q?: string | undefined
  collection?: string | undefined
  availability?: 'available' | 'sold-out' | undefined
  minPrice?: string | undefined
  maxPrice?: string | undefined
  sort?: NftSort
  page?: number
}

const decimalSearchParam = (value: unknown) => typeof value === 'string' && /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value) ? value : undefined

export function parseHomeSearch(search: Record<string, unknown>): HomeSearch {
  const sort = ['featured', 'price-asc', 'price-desc', 'newest'].includes(String(search.sort)) ? search.sort as NftSort : 'featured'
  const availability = search.availability === 'available' || search.availability === 'sold-out' ? search.availability : undefined
  const minPrice = decimalSearchParam(search.minPrice)
  const maxPrice = decimalSearchParam(search.maxPrice)
  return {
    ...(typeof search.q === 'string' && search.q ? { q: search.q } : {}),
    ...(typeof search.collection === 'string' && search.collection ? { collection: search.collection } : {}),
    ...(availability ? { availability } : {}),
    ...(minPrice ? { minPrice } : {}),
    ...(maxPrice ? { maxPrice } : {}),
    sort,
    page: Math.max(1, Number(search.page) || 1),
  }
}
