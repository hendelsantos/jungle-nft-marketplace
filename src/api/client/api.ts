import type {
  AddCartItemInput,
  ApplyCouponInput,
  AuthResponse,
  Cart,
  ChangePasswordInput,
  CreateOrderInput,
  FavoriteResponse,
  LoginInput,
  Nft,
  NftListResponse,
  NftSearchParams,
  Order,
  Profile,
  Quote,
  RegisterInput,
  Session,
  UpdateCartItemInput,
  UpdateProfileInput,
  Wallet,
  WalletInput,
} from '@/api/contracts'
import { apiClient } from './http'

const data = async <T>(promise: Promise<{ data: T }>) => (await promise).data

export const authApi = {
  session: (signal?: AbortSignal) => data(apiClient.get<Session>('/auth/session', { ...(signal ? { signal } : {}) })),
  login: (input: LoginInput) => data(apiClient.post<AuthResponse>('/auth/login', input)),
  register: (input: RegisterInput) => data(apiClient.post<AuthResponse>('/auth/register', input)),
  logout: () => data(apiClient.post<{ ok: true }>('/auth/logout')),
}

export const nftApi = {
  list: (params: NftSearchParams, signal?: AbortSignal) => data(apiClient.get<NftListResponse>('/nfts', { params, ...(signal ? { signal } : {}) })),
  detail: (id: string, signal?: AbortSignal) => data(apiClient.get<Nft>(`/nfts/${id}`, { ...(signal ? { signal } : {}) })),
}

export const favoritesApi = {
  list: (signal?: AbortSignal) => data(apiClient.get<FavoriteResponse>('/favorites', { ...(signal ? { signal } : {}) })),
  add: (nftId: string) => data(apiClient.post<FavoriteResponse>('/favorites', { nftId })),
  remove: (nftId: string) => data(apiClient.delete<FavoriteResponse>(`/favorites/${nftId}`)),
}

export const cartApi = {
  get: (signal?: AbortSignal) => data(apiClient.get<Cart>('/cart', { ...(signal ? { signal } : {}) })),
  add: (input: AddCartItemInput) => data(apiClient.post<Cart>('/cart/items', input)),
  update: (itemId: string, input: UpdateCartItemInput) => data(apiClient.patch<Cart>(`/cart/items/${itemId}`, input)),
  remove: (itemId: string) => data(apiClient.delete<Cart>(`/cart/items/${itemId}`)),
  coupon: (input: ApplyCouponInput) => data(apiClient.patch<Cart>('/cart/coupon', input)),
  quote: (signal?: AbortSignal) => data(apiClient.post<Quote>('/quotes', undefined, { ...(signal ? { signal } : {}) })),
}

export const ordersApi = {
  create: (input: CreateOrderInput, idempotencyKey: string) =>
    data(apiClient.post<Order>('/orders', input, { headers: { 'Idempotency-Key': idempotencyKey } })),
  get: (id: string, signal?: AbortSignal) => data(apiClient.get<Order>(`/orders/${id}`, { ...(signal ? { signal } : {}) })),
}

export const profileApi = {
  get: (signal?: AbortSignal) => data(apiClient.get<Profile>('/profile', { ...(signal ? { signal } : {}) })),
  update: (input: UpdateProfileInput) => data(apiClient.patch<Profile>('/profile', input)),
  password: (input: ChangePasswordInput) => data(apiClient.patch<{ ok: true }>('/profile/password', input)),
}

export const walletsApi = {
  list: (signal?: AbortSignal) => data(apiClient.get<Wallet[]>('/wallets', { ...(signal ? { signal } : {}) })),
  create: (input: WalletInput) => data(apiClient.post<Wallet>('/wallets', input)),
  update: (id: string, input: Partial<WalletInput> & { connected?: boolean }) => data(apiClient.patch<Wallet>(`/wallets/${id}`, input)),
  remove: (id: string) => data(apiClient.delete<{ ok: true }>(`/wallets/${id}`)),
}
