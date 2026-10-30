export interface UserIdentity {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export interface Session {
  id: string
  user: UserIdentity
  expiresAt: string
}

export interface LoginInput {
  email: string
  password: string
  anonymousCartId?: string
}

export interface RegisterInput extends LoginInput {
  name: string
  confirmPassword: string
}

export interface AuthResponse {
  session: Session
}
