import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { AuthProvider } from '@/features/auth/auth-provider'
import { RealtimeProvider } from '@/realtime/realtime-provider'
import { queryClient } from './query-client'
import { router } from '@/app/router/router'

export function AppProviders() {
  return <QueryClientProvider client={queryClient}><AuthProvider><RealtimeProvider><RouterProvider router={router} /></RealtimeProvider></AuthProvider></QueryClientProvider>
}
