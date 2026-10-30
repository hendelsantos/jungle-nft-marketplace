import type { PropsWithChildren } from 'react'
import { Navigate, useRouterState } from '@tanstack/react-router'
import { LoaderCircle } from 'lucide-react'
import { useAuth } from './auth-context'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { session, loading } = useAuth()
  const href = useRouterState({ select: (state) => state.location.href })
  if (loading) return <main className="page-shell grid min-h-[60vh] place-items-center"><LoaderCircle className="size-8 animate-spin text-accent" aria-label="Carregando sessão" /></main>
  if (!session) return <Navigate to="/login" search={{ redirect: href }} />
  return children
}
