export interface ApiErrorBody {
  error: {
    code: string
    message: string
    fieldErrors?: Record<string, string>
    retryable?: boolean
  }
}

export interface PageMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type Network = 'ethereum' | 'polygon'
export type OrderStatus = 'pending' | 'confirmed' | 'declined'

export interface RealtimeEnvelope<T> {
  eventId: string
  resourceId: string
  version: number
  occurredAt: string
  sessionId?: string
  userId?: string
  data: T
}
