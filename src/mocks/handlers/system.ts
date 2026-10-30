import { http, HttpResponse } from 'msw'
import { readDb, resetDb, writeDb } from '@/mocks/database/db'

export const systemHandlers = [
  http.post('/api/__mock/reset', () => {
    resetDb()
    return HttpResponse.json({ ok: true })
  }),
  http.post('/api/__mock/session/expire', ({ request }) => {
    const db = readDb()
    const token = request.headers.get('Authorization')?.replace(/^Bearer /, '')
    const session = db.sessions.find((candidate) => candidate.id === token)
    if (session) session.expiresAt = new Date(0).toISOString()
    writeDb(db)
    return HttpResponse.json({ ok: true })
  }),
]
