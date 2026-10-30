import type { Cart, Order, Quote, Session, Wallet } from '@/api/contracts'
import type { Nft } from '@/api/contracts/nft'
import type { MockUser } from '@/mocks/fixtures/users'

export interface StoredQuote {
  userId: string
  quote: Quote
}

export interface IdempotencyRecord {
  key: string
  userId: string
  payload: string
  orderId: string
}

export interface MockDatabase {
  schemaVersion: 1
  nfts: Nft[]
  users: MockUser[]
  sessions: Session[]
  favorites: Record<string, string[]>
  carts: Cart[]
  wallets: Wallet[]
  quotes: StoredQuote[]
  orders: Order[]
  idempotency: IdempotencyRecord[]
}
