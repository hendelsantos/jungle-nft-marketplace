import type { NftSort } from '@/api/contracts'

export interface HomeSearch {
  q?: string | undefined
  collection?: string | undefined
  availability?: 'available' | 'sold-out' | undefined
  minPrice?: number | undefined
  maxPrice?: number | undefined
  sort?: NftSort | undefined
  page?: number | undefined
}

const SORTS: NftSort[] = ['featured', 'price-asc', 'price-desc', 'newest']

export const parseDecimalFilter = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value
  if (typeof value === 'string' && /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) return Number(value)
  return undefined
}

export function parseHomeSearch(search: Record<string, unknown>): HomeSearch {
  const sort = SORTS.includes(search.sort as NftSort) ? search.sort as NftSort : undefined
  const availability = search.availability === 'available' || search.availability === 'sold-out' ? search.availability : undefined
  const minPrice = parseDecimalFilter(search.minPrice)
  const maxPrice = parseDecimalFilter(search.maxPrice)
  const page = Number.isInteger(Number(search.page)) && Number(search.page) >= 1 ? Number(search.page) : undefined
  return {
    ...(typeof search.q === 'string' && search.q ? { q: search.q } : {}),
    ...(typeof search.collection === 'string' && search.collection ? { collection: search.collection } : {}),
    ...(availability ? { availability } : {}),
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
    ...(sort ? { sort } : {}),
    ...(page ? { page } : {}),
  }
}
