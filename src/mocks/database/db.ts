import type { Cart } from '@/api/contracts'
import { nftFixtures } from '@/mocks/fixtures/nfts'
import { userFixtures, walletFixtures } from '@/mocks/fixtures/users'
import type { MockDatabase } from './types'

const DB_KEY = 'jungle:mock-db:v1'

export function createDatabase(): MockDatabase {
  return {
    schemaVersion: 1,
    nfts: structuredClone(nftFixtures),
    users: structuredClone(userFixtures),
    sessions: [],
    favorites: { user_ana: ['nft_2', 'nft_4'], user_caio: ['nft_1'] },
    carts: [],
    wallets: structuredClone(walletFixtures),
    quotes: [],
    orders: [],
    idempotency: [],
  }
}

export function readDb(): MockDatabase {
  const raw = localStorage.getItem(DB_KEY)
  if (!raw) {
    const initial = createDatabase()
    writeDb(initial)
    return initial
  }
  try {
    const parsed = JSON.parse(raw) as MockDatabase
    return parsed.schemaVersion === 1 ? parsed : createDatabase()
  } catch {
    return createDatabase()
  }
}

export function writeDb(db: MockDatabase) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

export function resetDb() {
  const db = createDatabase()
  writeDb(db)
  return db
}

export function getOrCreateCart(db: MockDatabase, userId?: string, anonymousId?: string): Cart {
  let cart = db.carts.find((candidate) => (userId ? candidate.userId === userId : candidate.anonymousId === anonymousId))
  if (!cart) {
    cart = {
      id: crypto.randomUUID(),
      ...(userId ? { userId } : { anonymousId: anonymousId ?? crypto.randomUUID() }),
      version: 1,
      items: [],
    }
    db.carts.push(cart)
  }
  return cart
}
