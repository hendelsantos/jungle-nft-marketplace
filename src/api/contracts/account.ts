import type { Network } from './common'

export interface Profile {
  userId: string
  name: string
  email: string
  bio: string
  country: string
  avatarUrl?: string
  version: number
}

export interface UpdateProfileInput {
  name: string
  bio: string
  country: string
  avatarUrl?: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface Wallet {
  id: string
  userId: string
  label: string
  address: string
  network: Network
  primary: boolean
  connected: boolean
  version: number
}

export interface WalletInput {
  label: string
  address: string
  network: Network
  primary: boolean
}
