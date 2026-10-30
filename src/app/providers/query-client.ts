import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/errors/api-error'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: true,
      retry: (count, error) => count < 2 && (!(error instanceof ApiError) || (error.retryable && error.status !== 401)),
    },
    mutations: { retry: false },
  },
})
