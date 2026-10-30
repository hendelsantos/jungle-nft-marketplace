import { http, HttpResponse } from 'msw'
import type { LoginInput, RegisterInput } from '@/api/contracts'
import { createSession, getSession, hashPassword } from '@/mocks/database/auth'
import { getOrCreateCart, readDb, writeDb } from '@/mocks/database/db'
import { applyScenarioDelay, errorResponse, scenarioOf } from './helpers'

function mergeAnonymousCart(db: ReturnType<typeof readDb>, userId: string, anonymousCartId?: string) {
  if (!anonymousCartId) return
  const guest = db.carts.find((cart) => cart.anonymousId === anonymousCartId)
  if (!guest) return
  const target = getOrCreateCart(db, userId)
  for (const item of guest.items) {
    const existing = target.items.find((candidate) => candidate.nftId === item.nftId && candidate.editionId === item.editionId)
    const nft = db.nfts.find((candidate) => candidate.id === item.nftId)
    const edition = nft?.editions.find((candidate) => candidate.id === item.editionId)
    if (!edition) continue
    if (existing) existing.quantity = Math.min(existing.quantity + item.quantity, edition.available)
    else target.items.push({ ...item, id: crypto.randomUUID(), quantity: Math.min(item.quantity, edition.available) })
  }
  target.version += 1
  db.carts = db.carts.filter((cart) => cart.id !== guest.id)
}

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    await applyScenarioDelay(request)
    const input = (await request.json()) as LoginInput
    const db = readDb()
    const user = db.users.find((candidate) => candidate.email.toLowerCase() === input.email.toLowerCase())
    if (!user || user.passwordHash !== hashPassword(input.password)) return errorResponse(401, 'INVALID_CREDENTIALS', 'E-mail ou senha inválidos.')
    if (scenarioOf(request) === 'session-expired') return errorResponse(401, 'SESSION_EXPIRED', 'Esta sessão de demonstração expirou.')
    mergeAnonymousCart(db, user.id, input.anonymousCartId ?? request.headers.get('X-Anonymous-Cart-Id') ?? undefined)
    const session = createSession(db, user.id)
    writeDb(db)
    return HttpResponse.json({ session })
  }),

  http.post('/api/auth/register', async ({ request }) => {
    await applyScenarioDelay(request)
    const input = (await request.json()) as RegisterInput
    const fieldErrors: Record<string, string> = {}
    if (input.name.trim().length < 2) fieldErrors.name = 'Informe seu nome.'
    if (!/^\S+@\S+\.\S+$/.test(input.email)) fieldErrors.email = 'Informe um e-mail válido.'
    if (input.password.length < 8) fieldErrors.password = 'Use ao menos 8 caracteres.'
    if (input.password !== input.confirmPassword) fieldErrors.confirmPassword = 'As senhas não coincidem.'
    if (Object.keys(fieldErrors).length) return errorResponse(400, 'VALIDATION_ERROR', 'Revise os campos informados.', fieldErrors)
    const db = readDb()
    if (db.users.some((candidate) => candidate.email.toLowerCase() === input.email.toLowerCase())) return errorResponse(409, 'USER_EXISTS', 'Já existe uma conta com este e-mail.')
    const id = `user_${crypto.randomUUID()}`
    db.users.push({
      id,
      email: input.email.toLowerCase(),
      passwordHash: hashPassword(input.password),
      profile: { userId: id, name: input.name.trim(), email: input.email.toLowerCase(), bio: '', country: 'Brasil', version: 1 },
    })
    db.favorites[id] = []
    mergeAnonymousCart(db, id, input.anonymousCartId ?? request.headers.get('X-Anonymous-Cart-Id') ?? undefined)
    const session = createSession(db, id)
    writeDb(db)
    return HttpResponse.json({ session }, { status: 201 })
  }),

  http.get('/api/auth/session', async ({ request }) => {
    await applyScenarioDelay(request)
    const db = readDb()
    const session = getSession(db, request)
    if (!session || scenarioOf(request) === 'session-expired') return errorResponse(401, 'SESSION_INVALID', 'Sua sessão expirou.')
    return HttpResponse.json(session)
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    const db = readDb()
    const session = getSession(db, request)
    if (session) db.sessions = db.sessions.filter((candidate) => candidate.id !== session.id)
    writeDb(db)
    return HttpResponse.json({ ok: true })
  }),
]
