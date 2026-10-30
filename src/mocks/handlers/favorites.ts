import { http, HttpResponse } from 'msw'
import { readDb, writeDb } from '@/mocks/database/db'
import { applyScenarioDelay, errorResponse, isResponse, requireSession, scenarioOf } from './helpers'

export const favoriteHandlers = [
  http.get('/api/favorites', async ({ request }) => {
    await applyScenarioDelay(request)
    const db = readDb()
    const session = requireSession(db, request)
    if (isResponse(session)) return session
    return HttpResponse.json({ nftIds: db.favorites[session.user.id] ?? [] })
  }),
  http.post('/api/favorites', async ({ request }) => {
    await applyScenarioDelay(request)
    if (scenarioOf(request) === 'favorite-failure') return errorResponse(500, 'FAVORITE_FAILED', 'Não foi possível salvar o favorito.', undefined, true)
    const db = readDb()
    const session = requireSession(db, request)
    if (isResponse(session)) return session
    const { nftId } = (await request.json()) as { nftId: string }
    if (!db.nfts.some((nft) => nft.id === nftId)) return errorResponse(404, 'NFT_NOT_FOUND', 'NFT não encontrado.')
    db.favorites[session.user.id] = [...new Set([...(db.favorites[session.user.id] ?? []), nftId])]
    writeDb(db)
    return HttpResponse.json({ nftIds: db.favorites[session.user.id] })
  }),
  http.delete('/api/favorites/:nftId', async ({ params, request }) => {
    await applyScenarioDelay(request)
    const db = readDb()
    const session = requireSession(db, request)
    if (isResponse(session)) return session
    db.favorites[session.user.id] = (db.favorites[session.user.id] ?? []).filter((id) => id !== params.nftId)
    writeDb(db)
    return HttpResponse.json({ nftIds: db.favorites[session.user.id] })
  }),
]
