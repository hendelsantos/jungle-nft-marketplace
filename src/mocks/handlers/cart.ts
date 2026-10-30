import { http, HttpResponse } from 'msw'
import type { AddCartItemInput, ApplyCouponInput, UpdateCartItemInput } from '@/api/contracts'
import { getSession } from '@/mocks/database/auth'
import { getOrCreateCart, readDb, writeDb } from '@/mocks/database/db'
import { applyScenarioDelay, errorResponse, hydrateCart } from './helpers'

function cartForRequest(request: Request) {
  const db = readDb()
  const session = getSession(db, request)
  const anonymousId = request.headers.get('X-Anonymous-Cart-Id') ?? 'anonymous-default'
  return { db, cart: getOrCreateCart(db, session?.user.id, session ? undefined : anonymousId) }
}

export const cartHandlers = [
  http.get('/api/cart', async ({ request }) => {
    await applyScenarioDelay(request)
    const { db, cart } = cartForRequest(request)
    writeDb(db)
    return HttpResponse.json(hydrateCart(db, cart))
  }),
  http.post('/api/cart/items', async ({ request }) => {
    await applyScenarioDelay(request)
    const input = (await request.json()) as AddCartItemInput
    const { db, cart } = cartForRequest(request)
    const nft = db.nfts.find((candidate) => candidate.id === input.nftId)
    const edition = nft?.editions.find((candidate) => candidate.id === input.editionId)
    if (!nft || !edition) return errorResponse(404, 'EDITION_NOT_FOUND', 'A edição selecionada não existe.')
    if (!Number.isInteger(input.quantity) || input.quantity < 1) return errorResponse(400, 'INVALID_QUANTITY', 'Use uma quantidade válida.')
    const existing = cart.items.find((item) => item.nftId === input.nftId && item.editionId === input.editionId)
    const nextQuantity = (existing?.quantity ?? 0) + input.quantity
    if (nextQuantity > edition.available) return errorResponse(409, 'INSUFFICIENT_STOCK', 'A quantidade solicitada não está disponível.')
    if (existing) existing.quantity = nextQuantity
    else cart.items.push({ id: crypto.randomUUID(), nftId: nft.id, editionId: edition.id, quantity: input.quantity, addedAt: new Date().toISOString(), catalogVersion: nft.version, nft })
    cart.version += 1
    writeDb(db)
    return HttpResponse.json(hydrateCart(db, cart), { status: 201 })
  }),
  http.patch('/api/cart/items/:itemId', async ({ params, request }) => {
    await applyScenarioDelay(request)
    const input = (await request.json()) as UpdateCartItemInput
    const { db, cart } = cartForRequest(request)
    const item = cart.items.find((candidate) => candidate.id === params.itemId)
    if (!item) return errorResponse(404, 'CART_ITEM_NOT_FOUND', 'Item não encontrado no carrinho.')
    const edition = db.nfts.find((nft) => nft.id === item.nftId)?.editions.find((candidate) => candidate.id === item.editionId)
    if (!edition || input.quantity > edition.available) return errorResponse(409, 'INSUFFICIENT_STOCK', 'O estoque mudou. Revise a quantidade.')
    if (!Number.isInteger(input.quantity) || input.quantity < 1) return errorResponse(400, 'INVALID_QUANTITY', 'Use uma quantidade válida.')
    item.quantity = input.quantity
    cart.version += 1
    writeDb(db)
    return HttpResponse.json(hydrateCart(db, cart))
  }),
  http.delete('/api/cart/items/:itemId', async ({ params, request }) => {
    await applyScenarioDelay(request)
    const { db, cart } = cartForRequest(request)
    const size = cart.items.length
    cart.items = cart.items.filter((item) => item.id !== params.itemId)
    if (cart.items.length === size) return errorResponse(404, 'CART_ITEM_NOT_FOUND', 'Item não encontrado no carrinho.')
    cart.version += 1
    writeDb(db)
    return HttpResponse.json(hydrateCart(db, cart))
  }),
  http.patch('/api/cart/coupon', async ({ request }) => {
    await applyScenarioDelay(request)
    const input = (await request.json()) as ApplyCouponInput
    const { db, cart } = cartForRequest(request)
    const code = input.code?.trim().toUpperCase() ?? null
    if (code === 'EXPIRED10') return errorResponse(409, 'COUPON_EXPIRED', 'Este cupom expirou.')
    if (code && code !== 'JUNGLE10') return errorResponse(404, 'COUPON_INVALID', 'Cupom inválido.')
    if (code) cart.couponCode = code
    else delete cart.couponCode
    cart.version += 1
    writeDb(db)
    return HttpResponse.json(hydrateCart(db, cart))
  }),
]
