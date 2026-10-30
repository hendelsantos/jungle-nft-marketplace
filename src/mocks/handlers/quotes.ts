import { http, HttpResponse } from 'msw'
import { addEth, multiplyEth, percentOfEth, subtractEth } from '@/lib/money'
import type { Quote } from '@/api/contracts'
import { getOrCreateCart, readDb, writeDb } from '@/mocks/database/db'
import { applyScenarioDelay, errorResponse, isResponse, requireSession, scenarioOf } from './helpers'

export const quoteHandlers = [
  http.post('/api/quotes', async ({ request }) => {
    await applyScenarioDelay(request)
    const db = readDb()
    const session = requireSession(db, request)
    if (isResponse(session)) return session
    const cart = getOrCreateCart(db, session.user.id)
    if (!cart.items.length) return errorResponse(409, 'EMPTY_CART', 'Seu carrinho está vazio.')
    const lines: Quote['lines'] = []
    let acknowledgedCatalogChange = false
    for (const item of cart.items) {
      const nft = db.nfts.find((candidate) => candidate.id === item.nftId)
      const edition = nft?.editions.find((candidate) => candidate.id === item.editionId)
      if (!nft || !edition || edition.available < item.quantity || scenarioOf(request) === 'sold-out') return errorResponse(409, 'QUOTE_STALE', 'Preço ou disponibilidade mudou. Revise seu carrinho.')
      if (item.catalogVersion !== nft.version) { item.catalogVersion = nft.version; acknowledgedCatalogChange = true }
      lines.push({ cartItemId: item.id, nftId: nft.id, editionId: edition.id, name: nft.name, imageUrl: nft.imageUrl, quantity: item.quantity, unitPriceEth: edition.priceEth, lineTotalEth: multiplyEth(edition.priceEth, item.quantity), catalogVersion: nft.version })
    }
    const subtotalEth = addEth(...lines.map((line) => line.lineTotalEth))
    const discountEth = cart.couponCode === 'JUNGLE10' ? percentOfEth(subtotalEth, '10') : '0'
    const networkFeeEth = percentOfEth(subtractEth(subtotalEth, discountEth), '1.5')
    if (acknowledgedCatalogChange) cart.version += 1
    const quote: Quote = {
      id: crypto.randomUUID(),
      cartVersion: cart.version,
      expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
      ...(cart.couponCode ? { couponCode: cart.couponCode } : {}),
      lines,
      subtotalEth,
      discountEth,
      networkFeeEth,
      totalEth: addEth(subtractEth(subtotalEth, discountEth), networkFeeEth),
    }
    db.quotes = db.quotes.filter((stored) => stored.userId !== session.user.id)
    db.quotes.push({ userId: session.user.id, quote })
    writeDb(db)
    return HttpResponse.json(quote, { status: 201 })
  }),
]
