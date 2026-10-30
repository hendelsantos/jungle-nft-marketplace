import { http, HttpResponse } from 'msw'
import type { ChangePasswordInput, UpdateProfileInput, WalletInput } from '@/api/contracts'
import { hashPassword } from '@/mocks/database/auth'
import { readDb, writeDb } from '@/mocks/database/db'
import { applyScenarioDelay, errorResponse, isResponse, requireSession } from './helpers'

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)

export const accountHandlers = [
  http.get('/api/profile', async ({ request }) => {
    await applyScenarioDelay(request)
    const db = readDb()
    const session = requireSession(db, request)
    if (isResponse(session)) return session
    const profile = db.users.find((user) => user.id === session.user.id)?.profile
    return profile ? HttpResponse.json(profile) : errorResponse(404, 'PROFILE_NOT_FOUND', 'Perfil não encontrado.')
  }),
  http.patch('/api/profile', async ({ request }) => {
    await applyScenarioDelay(request)
    const db = readDb()
    const session = requireSession(db, request)
    if (isResponse(session)) return session
    const input = (await request.json()) as UpdateProfileInput
    const user = db.users.find((candidate) => candidate.id === session.user.id)
    if (!user) return errorResponse(404, 'PROFILE_NOT_FOUND', 'Perfil não encontrado.')
    const fields: Record<string, string> = {}
    if (input.name.trim().length < 2) fields.name = 'Informe ao menos 2 caracteres.'
    if (input.bio.length > 240) fields.bio = 'Use no máximo 240 caracteres.'
    if (!input.country.trim()) fields.country = 'Informe o país.'
    if (Object.keys(fields).length) return errorResponse(400, 'VALIDATION_ERROR', 'Revise os campos.', fields)
    user.profile = { ...user.profile, ...input, name: input.name.trim(), version: user.profile.version + 1 }
    const dbSession = db.sessions.find((candidate) => candidate.id === session.id)
    if (dbSession) {
      dbSession.user.name = user.profile.name
      if (input.avatarUrl) dbSession.user.avatarUrl = input.avatarUrl
    }
    writeDb(db)
    return HttpResponse.json(user.profile)
  }),
  http.patch('/api/profile/password', async ({ request }) => {
    await applyScenarioDelay(request)
    const db = readDb()
    const session = requireSession(db, request)
    if (isResponse(session)) return session
    const input = (await request.json()) as ChangePasswordInput
    const user = db.users.find((candidate) => candidate.id === session.user.id)
    if (!user) return errorResponse(404, 'PROFILE_NOT_FOUND', 'Perfil não encontrado.')
    if (user.passwordHash !== hashPassword(input.currentPassword)) return errorResponse(400, 'CURRENT_PASSWORD_INVALID', 'A senha atual está incorreta.', { currentPassword: 'Senha atual incorreta.' })
    if (input.newPassword.length < 8) return errorResponse(400, 'VALIDATION_ERROR', 'A nova senha é muito curta.', { newPassword: 'Use ao menos 8 caracteres.' })
    if (input.newPassword !== input.confirmPassword) return errorResponse(400, 'VALIDATION_ERROR', 'As senhas não coincidem.', { confirmPassword: 'As senhas não coincidem.' })
    user.passwordHash = hashPassword(input.newPassword)
    writeDb(db)
    return HttpResponse.json({ ok: true })
  }),
  http.get('/api/wallets', async ({ request }) => {
    await applyScenarioDelay(request)
    const db = readDb()
    const session = requireSession(db, request)
    if (isResponse(session)) return session
    return HttpResponse.json(db.wallets.filter((wallet) => wallet.userId === session.user.id))
  }),
  http.post('/api/wallets', async ({ request }) => {
    await applyScenarioDelay(request)
    const db = readDb()
    const session = requireSession(db, request)
    if (isResponse(session)) return session
    const input = (await request.json()) as WalletInput
    if (!input.label.trim() || !isAddress(input.address)) return errorResponse(400, 'VALIDATION_ERROR', 'Revise os dados da carteira.', { ...(!input.label.trim() ? { label: 'Informe um nome.' } : {}), ...(!isAddress(input.address) ? { address: 'Use um endereço 0x com 40 caracteres hexadecimais.' } : {}) })
    if (db.wallets.some((wallet) => wallet.userId === session.user.id && wallet.address.toLowerCase() === input.address.toLowerCase())) return errorResponse(409, 'WALLET_EXISTS', 'Esta carteira já está cadastrada.')
    const userWallets = db.wallets.filter((wallet) => wallet.userId === session.user.id)
    const primary = input.primary || userWallets.length === 0
    if (primary) userWallets.forEach((wallet) => { wallet.primary = false })
    const wallet = { id: `wallet_${crypto.randomUUID()}`, userId: session.user.id, ...input, primary, label: input.label.trim(), connected: false, version: 1 }
    db.wallets.push(wallet)
    writeDb(db)
    return HttpResponse.json(wallet, { status: 201 })
  }),
  http.patch('/api/wallets/:id', async ({ params, request }) => {
    await applyScenarioDelay(request)
    const db = readDb()
    const session = requireSession(db, request)
    if (isResponse(session)) return session
    const wallet = db.wallets.find((candidate) => candidate.id === params.id)
    if (!wallet) return errorResponse(404, 'WALLET_NOT_FOUND', 'Carteira não encontrada.')
    if (wallet.userId !== session.user.id) return errorResponse(403, 'FORBIDDEN', 'Carteira de outro usuário.')
    const input = (await request.json()) as Partial<WalletInput> & { connected?: boolean }
    if (input.address && !isAddress(input.address)) return errorResponse(400, 'VALIDATION_ERROR', 'Endereço inválido.', { address: 'Use um endereço 0x válido.' })
    if (input.primary) db.wallets.filter((candidate) => candidate.userId === session.user.id).forEach((candidate) => { candidate.primary = false })
    Object.assign(wallet, input, { version: wallet.version + 1 })
    writeDb(db)
    return HttpResponse.json(wallet)
  }),
  http.delete('/api/wallets/:id', async ({ params, request }) => {
    await applyScenarioDelay(request)
    const db = readDb()
    const session = requireSession(db, request)
    if (isResponse(session)) return session
    const wallet = db.wallets.find((candidate) => candidate.id === params.id)
    if (!wallet) return errorResponse(404, 'WALLET_NOT_FOUND', 'Carteira não encontrada.')
    if (wallet.userId !== session.user.id) return errorResponse(403, 'FORBIDDEN', 'Carteira de outro usuário.')
    db.wallets = db.wallets.filter((candidate) => candidate.id !== wallet.id)
    if (wallet.primary) {
      const fallback = db.wallets.find((candidate) => candidate.userId === session.user.id)
      if (fallback) fallback.primary = true
    }
    writeDb(db)
    return HttpResponse.json({ ok: true })
  }),
]
