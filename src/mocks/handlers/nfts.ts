import Decimal from 'decimal.js'
import { http, HttpResponse } from 'msw'
import type { NftSearchParams, NftSort, RealtimeEnvelope } from '@/api/contracts'
import { readDb, writeDb } from '@/mocks/database/db'
import { emitRealtime } from '@/mocks/realtime/hub'
import { applyScenarioDelay, errorResponse, scenarioOf } from './helpers'

export const nftHandlers = [
  http.get('/api/nfts', async ({ request }) => {
    await applyScenarioDelay(request)
    const scenario = scenarioOf(request)
    if (scenario === 'network-error') return HttpResponse.error()
    if (scenario === 'server-error') return errorResponse(500, 'CATALOG_UNAVAILABLE', 'O catálogo está temporariamente indisponível.', undefined, true)
    const db = readDb()
    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.trim().toLowerCase() ?? ''
    const collections = [...url.searchParams.getAll('collections'), ...url.searchParams.getAll('collections[]')].flatMap((value) => value.split(',')).filter(Boolean)
    const availability = url.searchParams.get('availability') as NftSearchParams['availability']
    const minPrice = url.searchParams.get('minPrice')
    const maxPrice = url.searchParams.get('maxPrice')
    const sort = (url.searchParams.get('sort') ?? 'featured') as NftSort
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1))
    const pageSize = Math.min(12, Math.max(1, Number(url.searchParams.get('pageSize') ?? 6)))
    let items = db.nfts.filter((nft) => {
      const searchable = `${nft.name} ${nft.collection} ${nft.creator}`.toLowerCase()
      const lowest = Decimal.min(...nft.editions.map((edition) => edition.priceEth))
      const available = nft.editions.some((edition) => edition.available > 0)
      return (!q || searchable.includes(q)) && (!collections.length || collections.includes(nft.collection)) &&
        (!availability || (availability === 'available' ? available : !available)) &&
        (!minPrice || lowest.greaterThanOrEqualTo(minPrice)) && (!maxPrice || lowest.lessThanOrEqualTo(maxPrice))
    })
    items = [...items].sort((a, b) => {
      const aPrice = Decimal.min(...a.editions.map((edition) => edition.priceEth))
      const bPrice = Decimal.min(...b.editions.map((edition) => edition.priceEth))
      if (sort === 'price-asc') return aPrice.comparedTo(bPrice)
      if (sort === 'price-desc') return bPrice.comparedTo(aPrice)
      if (sort === 'newest') return b.id.localeCompare(a.id)
      return Number(b.featured) - Number(a.featured)
    })
    const total = items.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const start = (page - 1) * pageSize
    return HttpResponse.json({ items: items.slice(start, start + pageSize), meta: { page, pageSize, total, totalPages }, filters: { collections: [...new Set(db.nfts.map((nft) => nft.collection))] } })
  }),

  http.get('/api/nfts/:id', async ({ params, request }) => {
    await applyScenarioDelay(request)
    const nft = readDb().nfts.find((candidate) => candidate.id === params.id || candidate.slug === params.id)
    return nft ? HttpResponse.json(nft) : errorResponse(404, 'NFT_NOT_FOUND', 'Este NFT não foi encontrado.')
  }),

  http.post('/api/__mock/nfts/:id/update', async ({ params, request }) => {
    const db = readDb()
    const nft = db.nfts.find((candidate) => candidate.id === params.id)
    if (!nft) return errorResponse(404, 'NFT_NOT_FOUND', 'NFT não encontrado.')
    const input = (await request.json()) as { editionId?: string; priceEth?: string; available?: number; version?: number; eventId?: string }
    const edition = nft.editions.find((candidate) => candidate.id === (input.editionId ?? nft.editions[0]?.id))
    if (!edition) return errorResponse(404, 'EDITION_NOT_FOUND', 'Edição não encontrada.')
    if (input.version !== undefined && input.version <= nft.version) {
      const stale = structuredClone(nft)
      const staleEdition = stale.editions.find((candidate) => candidate.id === edition.id)
      if (staleEdition && input.priceEth) staleEdition.priceEth = input.priceEth
      const stalePayload: RealtimeEnvelope<typeof stale> = { eventId: input.eventId ?? crypto.randomUUID(), resourceId: stale.id, version: input.version, occurredAt: new Date().toISOString(), data: stale }
      emitRealtime('nft.updated', stalePayload)
      return HttpResponse.json(stalePayload)
    }
    if (input.priceEth) edition.priceEth = input.priceEth
    if (typeof input.available === 'number') edition.available = input.available
    nft.version = input.version ?? nft.version + 1
    writeDb(db)
    const payload: RealtimeEnvelope<typeof nft> = { eventId: input.eventId ?? crypto.randomUUID(), resourceId: nft.id, version: nft.version, occurredAt: new Date().toISOString(), data: nft }
    emitRealtime('nft.updated', payload)
    return HttpResponse.json(payload)
  }),
]
