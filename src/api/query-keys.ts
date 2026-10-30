import type { NftSearchParams } from './contracts'

export const queryKeys = {
  session: ['session'] as const,
  nfts: {
    all: ['nfts'] as const,
    list: (params: NftSearchParams) => ['nfts', 'list', params] as const,
    detail: (id: string) => ['nfts', 'detail', id] as const,
  },
  favorites: (userId: string) => ['users', userId, 'favorites'] as const,
  cart: (identity: string) => ['identity', identity, 'cart'] as const,
  quote: (userId: string) => ['users', userId, 'quote'] as const,
  order: (userId: string, orderId: string) => ['users', userId, 'orders', orderId] as const,
  profile: (userId: string) => ['users', userId, 'profile'] as const,
  wallets: (userId: string) => ['users', userId, 'wallets'] as const,
}
