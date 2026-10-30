import type { PageMeta } from './common'

export interface NftEdition {
  id: string
  label: string
  priceEth: string
  available: number
}

export interface NftProperty {
  trait: string
  value: string
}

export interface Nft {
  id: string
  slug: string
  name: string
  description: string
  collection: string
  creator: string
  imageUrl: string
  accent: string
  featured: boolean
  version: number
  editions: NftEdition[]
  properties: NftProperty[]
}

export type NftSort = 'featured' | 'price-asc' | 'price-desc' | 'newest'

export interface NftSearchParams {
  q?: string
  collections?: string[]
  availability?: 'available' | 'sold-out'
  minPrice?: string
  maxPrice?: string
  sort?: NftSort
  page?: number
  pageSize?: number
}

export interface NftListResponse {
  items: Nft[]
  meta: PageMeta
  filters: { collections: string[] }
}

export interface FavoriteResponse {
  nftIds: string[]
}
