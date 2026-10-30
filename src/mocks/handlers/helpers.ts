import { delay, HttpResponse } from 'msw'
import type { ApiErrorBody, Cart, Session } from '@/api/contracts'
import { getSession } from '@/mocks/database/auth'
import type { MockDatabase } from '@/mocks/database/types'

export function errorResponse(status: number, code: string, message: string, fieldErrors?: Record<string, string>, retryable = false) {
  const body: ApiErrorBody = { error: { code, message, ...(fieldErrors ? { fieldErrors } : {}), ...(retryable ? { retryable } : {}) } }
  return HttpResponse.json(body, { status })
}

export function requireSession(db: MockDatabase, request: Request): Session | Response {
  const session = getSession(db, request)
  return session ?? errorResponse(401, 'SESSION_INVALID', 'Sua sessão expirou. Entre novamente para continuar.')
}

export function scenarioOf(request: Request) {
  return request.headers.get('X-Mock-Scenario') ?? 'default'
}

export async function applyScenarioDelay(request: Request) {
  const scenario = scenarioOf(request)
  if (scenario === 'slow') await delay(1400)
  else if (scenario === 'variable-latency') {
    const checksum = [...request.url].reduce((total, character) => total + character.charCodeAt(0), 0)
    await delay(120 + (checksum % 480))
  } else if (scenario === 'out-of-order') {
    const query = new URL(request.url).searchParams.get('q') ?? ''
    await delay(query.toLowerCase().includes('slow') ? 900 : 40)
  }
  else await delay(80)
}

export function hydrateCart(db: MockDatabase, cart: Cart): Cart {
  return {
    ...cart,
    items: cart.items.flatMap((item) => {
      const nft = db.nfts.find((candidate) => candidate.id === item.nftId)
      return nft ? [{ ...item, nft }] : []
    }),
  }
}

export function isResponse(value: unknown): value is Response {
  return value instanceof Response
}
