import { createContext, useContext, useEffect, type PropsWithChildren } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { LoginInput, RegisterInput, Session } from '@/api/contracts'
import { authApi } from '@/api/client/api'
import { queryKeys } from '@/api/query-keys'

interface AuthContextValue {
  session: Session | null
  loading: boolean
  login: (input: LoginInput) => Promise<Session>
  register: (input: RegisterInput) => Promise<Session>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function ensureAnonymousCartId() {
  let id = localStorage.getItem('jungle:anonymous-cart-id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('jungle:anonymous-cart-id', id)
  }
  return id
}

export function AuthProvider({ children }: PropsWithChildren) {
  const client = useQueryClient()
  const hasSession = Boolean(localStorage.getItem('jungle:session-id'))
  const sessionQuery = useQuery({
    queryKey: queryKeys.session,
    queryFn: ({ signal }) => authApi.session(signal),
    enabled: hasSession,
    retry: false,
    staleTime: 60_000,
  })

  useEffect(() => {
    ensureAnonymousCartId()
    if (sessionQuery.isError) localStorage.removeItem('jungle:session-id')
  }, [sessionQuery.isError])

  const establish = async (request: Promise<{ session: Session }>) => {
    const result = await request
    localStorage.setItem('jungle:session-id', result.session.id)
    client.setQueryData(queryKeys.session, result.session)
    await client.invalidateQueries({ queryKey: ['identity'] })
    return result.session
  }

  const loginMutation = useMutation({ mutationFn: (input: LoginInput) => establish(authApi.login({ ...input, anonymousCartId: ensureAnonymousCartId() })) })
  const registerMutation = useMutation({ mutationFn: (input: RegisterInput) => establish(authApi.register({ ...input, anonymousCartId: ensureAnonymousCartId() })) })
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: async () => {
      localStorage.removeItem('jungle:session-id')
      client.clear()
    },
  })

  return (
    <AuthContext.Provider value={{
      session: sessionQuery.data ?? null,
      loading: sessionQuery.isLoading,
      login: (input) => loginMutation.mutateAsync(input),
      register: (input) => registerMutation.mutateAsync(input),
      logout: async () => { await logoutMutation.mutateAsync() },
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
