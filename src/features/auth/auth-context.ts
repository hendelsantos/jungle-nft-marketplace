import { createContext, useContext } from 'react'
import type { LoginInput, RegisterInput, Session } from '@/api/contracts'

export interface AuthContextValue {
  session: Session | null
  loading: boolean
  login: (input: LoginInput) => Promise<Session>
  register: (input: RegisterInput) => Promise<Session>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
