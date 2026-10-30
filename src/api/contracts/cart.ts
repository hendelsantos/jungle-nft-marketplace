import type { Nft } from './nft'

export interface CartItem {
  id: string
  nftId: string
  editionId: string
  quantity: number
  addedAt: string
  catalogVersion: number
  nft: Nft
}

export interface Cart {
  id: string
  userId?: string
  anonymousId?: string
  couponCode?: string
  version: number
  items: CartItem[]
}

export interface AddCartItemInput {
  nftId: string
  editionId: string
  quantity: number
  anonymousCartId?: string
}

export interface UpdateCartItemInput {
  quantity: number
}

export interface ApplyCouponInput {
  code: string | null
}

export interface QuoteLine {
  cartItemId: string
  nftId: string
  editionId: string
  name: string
  imageUrl: string
  quantity: number
  unitPriceEth: string
  lineTotalEth: string
  catalogVersion: number
}

export interface Quote {
  id: string
  cartVersion: number
  expiresAt: string
  couponCode?: string
  lines: QuoteLine[]
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
}
