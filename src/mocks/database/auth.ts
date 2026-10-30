import type { Session } from '@/api/contracts'
import type { MockDatabase } from './types'

export function hashPassword(value: string) {
  let hash = 2166136261
  for (const char of value) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return `demo$${(hash >>> 0).toString(16).padStart(8, '0')}`
}

export function getSession(db: MockDatabase, request: Request): Session | undefined {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '')
  if (!token) return undefined
  const session = db.sessions.find((candidate) => candidate.id === token)
  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) return undefined
  return session
}

export function createSession(db: MockDatabase, userId: string): Session {
  const user = db.users.find((candidate) => candidate.id === userId)
  if (!user) throw new Error('Mock user missing')
  const session: Session = {
    id: crypto.randomUUID(),
    user: { id: user.id, name: user.profile.name, email: user.email, ...(user.profile.avatarUrl ? { avatarUrl: user.profile.avatarUrl } : {}) },
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
  }
  db.sessions.push(session)
  return session
}
