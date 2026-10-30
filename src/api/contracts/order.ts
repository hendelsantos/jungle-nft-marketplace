import type { Network, OrderStatus } from './common'
import type { Quote } from './cart'

export interface CollectorInput {
  fullName: string
  email: string
  country: string
}

export interface CreateOrderInput {
  quoteId: string
  walletId: string
  network: Network
  collector: CollectorInput
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  statusVersion: number
  createdAt: string
  updatedAt: string
  network: Network
  walletAddress: string
  transactionId?: string
  declineReason?: string
  receipt: Quote
}
