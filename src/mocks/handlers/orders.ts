import { delay, http, HttpResponse } from 'msw'
import type { CreateOrderInput, Nft, Order, RealtimeEnvelope } from '@/api/contracts'
import { readDb, writeDb } from '@/mocks/database/db'
import { emitRealtime } from '@/mocks/realtime/hub'
import { applyScenarioDelay, errorResponse, isResponse, requireSession, scenarioOf } from './helpers'

function canonical(input: CreateOrderInput) {
  return JSON.stringify({ collector: { fullName: input.collector.fullName, email: input.collector.email, country: input.collector.country }, network: input.network, quoteId: input.quoteId, walletId: input.walletId })
}

function settleOrder(orderId: string, declined: boolean) {
  const db = readDb()
  const order = db.orders.find((candidate) => candidate.id === orderId)
  if (!order || order.status !== 'pending') return
  order.status = declined ? 'declined' : 'confirmed'
  order.statusVersion += 1
  order.updatedAt = new Date().toISOString()
  if (declined) order.declineReason = 'A carteira simulada recusou a transação.'
  else { delete order.declineReason; order.transactionId = `0xsim${crypto.randomUUID().replaceAll('-', '')}` }
  const updatedNfts: Nft[] = []
  if (!declined) {
    const cart = db.carts.find((candidate) => candidate.userId === order.userId)
    if (cart) {
      for (const line of order.receipt.lines) {
        const item = cart.items.find((candidate) => candidate.id === line.cartItemId)
        if (!item) continue
        item.quantity -= line.quantity
        const nft = db.nfts.find((candidate) => candidate.id === line.nftId)
        const edition = nft?.editions.find((candidate) => candidate.id === line.editionId)
        if (edition && nft) { edition.available = Math.max(0, edition.available - line.quantity); nft.version += 1; updatedNfts.push(nft) }
      }
      cart.items = cart.items.filter((item) => item.quantity > 0)
      cart.version += 1
    }
  }
  writeDb(db)
  for (const nft of updatedNfts) emitRealtime('nft.updated', { eventId: crypto.randomUUID(), resourceId: nft.id, version: nft.version, occurredAt: order.updatedAt, data: nft })
  const activeSession = db.sessions.find((session) => session.user.id === order.userId && new Date(session.expiresAt).getTime() > Date.now())
  const payload: RealtimeEnvelope<Order> = { eventId: crypto.randomUUID(), resourceId: order.id, version: order.statusVersion, occurredAt: order.updatedAt, ...(activeSession ? { sessionId: activeSession.id } : {}), userId: order.userId, data: order }
  emitRealtime('order.updated', payload)
}

export const orderHandlers = [
  http.post('/api/orders', async ({ request }) => {
    await applyScenarioDelay(request)
    const db = readDb()
    const session = requireSession(db, request)
    if (isResponse(session)) return session
    const key = request.headers.get('Idempotency-Key')
    if (!key) return errorResponse(400, 'IDEMPOTENCY_REQUIRED', 'A chave de idempotência é obrigatória.')
    const input = (await request.json()) as CreateOrderInput
    const payload = canonical(input)
    const replay = db.idempotency.find((candidate) => candidate.key === key && candidate.userId === session.user.id)
    if (replay) {
      if (replay.payload !== payload) return errorResponse(409, 'IDEMPOTENCY_CONFLICT', 'A chave já foi usada com dados diferentes.')
      const order = db.orders.find((candidate) => candidate.id === replay.orderId)
      return order ? HttpResponse.json(order) : errorResponse(500, 'ORDER_RECOVERY_FAILED', 'Não foi possível recuperar o pedido.')
    }
    const quote = db.quotes.find((candidate) => candidate.userId === session.user.id && candidate.quote.id === input.quoteId)?.quote
    if (!quote || new Date(quote.expiresAt).getTime() <= Date.now()) return errorResponse(409, 'QUOTE_EXPIRED', 'A cotação expirou. Gere uma nova cotação.')
    const wallet = db.wallets.find((candidate) => candidate.id === input.walletId && candidate.userId === session.user.id)
    if (!wallet || wallet.network !== input.network) return errorResponse(400, 'WALLET_NETWORK_MISMATCH', 'Selecione uma carteira compatível com a rede.')
    const cart = db.carts.find((candidate) => candidate.userId === session.user.id)
    if (!cart || cart.version !== quote.cartVersion || quote.lines.some((line) => db.nfts.find((nft) => nft.id === line.nftId)?.version !== line.catalogVersion)) return errorResponse(409, 'QUOTE_STALE', 'O catálogo ou carrinho mudou. Revise a cotação.')
    const now = new Date().toISOString()
    const declined = scenarioOf(request) === 'payment-declined'
    const order: Order = { id: `order_${crypto.randomUUID()}`, userId: session.user.id, status: 'pending', statusVersion: 1, createdAt: now, updatedAt: now, network: input.network, walletAddress: wallet.address, ...(declined ? { declineReason: '__mock_pending_decline__' } : {}), receipt: structuredClone(quote) }
    db.orders.push(order)
    db.idempotency.push({ key, userId: session.user.id, payload, orderId: order.id })
    writeDb(db)
    // O settle acontece via GET /api/orders/:id (polling do cliente) para não
    // limpar o carrinho nem invalidar a cotação enquanto a criação ainda está
    // pendente no cliente (cenário order-timeout).
    if (scenarioOf(request) === 'order-timeout') {
      await delay(15_000)
      return HttpResponse.json(order, { status: 201 })
    }
    return HttpResponse.json(order, { status: 201 })
  }),
  http.get('/api/orders/:id', async ({ params, request }) => {
    await applyScenarioDelay(request)
    const db = readDb()
    const session = requireSession(db, request)
    if (isResponse(session)) return session
    let order = db.orders.find((candidate) => candidate.id === params.id)
    if (!order) return errorResponse(404, 'ORDER_NOT_FOUND', 'Pedido não encontrado.')
    if (order.userId !== session.user.id) return errorResponse(403, 'FORBIDDEN', 'Você não pode acessar este pedido.')
    if (order.status === 'pending' && Date.now() - new Date(order.createdAt).getTime() >= 900) {
      settleOrder(order.id, order.declineReason === '__mock_pending_decline__')
      order = readDb().orders.find((candidate) => candidate.id === params.id) ?? order
    }
    return HttpResponse.json(order)
  }),
]
