import axios from 'axios'
import type { ApiErrorBody } from '@/api/contracts'

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors: Record<string, string> | undefined
  readonly retryable: boolean

  constructor(message: string, status = 0, code = 'UNKNOWN', fieldErrors?: Record<string, string>, retryable = false) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
    this.retryable = retryable
  }
}

export function normalizeApiError(error: unknown) {
  if (error instanceof ApiError) return error
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data?.error
    return new ApiError(
      body?.message ?? (error.code === 'ECONNABORTED' ? 'A operação excedeu o tempo limite.' : 'Não foi possível conectar.'),
      error.response?.status ?? 0,
      body?.code ?? error.code ?? 'NETWORK_ERROR',
      body?.fieldErrors,
      body?.retryable ?? !error.response,
    )
  }
  return new ApiError('Ocorreu um erro inesperado.')
}
