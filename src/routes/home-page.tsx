import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import Decimal from 'decimal.js'
import { ArrowRight, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import type { NftSearchParams, NftSort } from '@/api/contracts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/feedback/error-state'
import { InlineMessage } from '@/components/feedback/inline-message'
import { NftCard } from '@/features/catalog/nft-card'
import { useNfts } from '@/features/catalog/queries'
import type { HomeSearch } from '@/routes/home-search'

export function HomePage() {
  const search = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })
  const [term, setTerm] = useState(search.q ?? '')
  const [minPrice, setMinPrice] = useState(search.minPrice !== undefined ? String(search.minPrice) : '')
  const [maxPrice, setMaxPrice] = useState(search.maxPrice !== undefined ? String(search.maxPrice) : '')
  const [priceError, setPriceError] = useState<string>()
  const [trackedSearch, setTrackedSearch] = useState({ q: search.q, minPrice: search.minPrice, maxPrice: search.maxPrice })
  if (search.q !== trackedSearch.q || search.minPrice !== trackedSearch.minPrice || search.maxPrice !== trackedSearch.maxPrice) {
    setTrackedSearch({ q: search.q, minPrice: search.minPrice, maxPrice: search.maxPrice })
    setTerm(search.q ?? '')
    setMinPrice(search.minPrice !== undefined ? String(search.minPrice) : '')
    setMaxPrice(search.maxPrice !== undefined ? String(search.maxPrice) : '')
  }
  const currentPage = search.page ?? 1
  const currentSort = search.sort ?? 'featured'
  const params: NftSearchParams = {
    ...(search.q ? { q: search.q } : {}),
    ...(search.collection ? { collections: [search.collection] } : {}),
    ...(search.availability ? { availability: search.availability } : {}),
    ...(search.minPrice !== undefined ? { minPrice: String(search.minPrice) } : {}),
    ...(search.maxPrice !== undefined ? { maxPrice: String(search.maxPrice) } : {}),
    sort: currentSort,
    page: currentPage,
    pageSize: 6,
  }
  const query = useNfts(params)
  const setSearch = (patch: Partial<HomeSearch>, resetPage = true) => void navigate({ search: (previous: Partial<HomeSearch>) => ({ ...previous, ...patch, ...(resetPage && (previous.page ?? 1) > 1 ? { page: 1 } : {}) }) })
  const applySearchAndPrice = () => {
    const nextMinPrice = minPrice.trim()
    const nextMaxPrice = maxPrice.trim()
    if (nextMinPrice && nextMaxPrice && new Decimal(nextMinPrice).greaterThan(nextMaxPrice)) {
      setPriceError('O preço mínimo deve ser menor ou igual ao preço máximo.')
      return
    }
    setPriceError(undefined)
    setSearch({
      q: term.trim() || undefined,
      minPrice: nextMinPrice ? Number(nextMinPrice) : undefined,
      maxPrice: nextMaxPrice ? Number(nextMaxPrice) : undefined,
    })
  }
  return (
    <div>
      <section className="page-shell pt-6 sm:pt-10">
        <div className="relative overflow-hidden rounded-[1.75rem] border bg-panel px-6 py-14 sm:px-12 sm:py-20 lg:px-20">
          <div className="pointer-events-none absolute -right-24 -top-32 size-[32rem] rounded-full bg-violet/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-48 right-1/4 size-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative max-w-3xl"><p className="eyebrow flex items-center gap-2"><Sparkles className="size-4" /> Colecionáveis que vivem além do jogo</p><h1 className="mt-5 text-4xl font-black leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">Descubra o lado <span className="text-accent">selvagem</span> do digital.</h1><p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg">Explore edições únicas, acompanhe preços ao vivo e monte sua coleção em uma experiência totalmente simulada e segura.</p><a href="#catalog" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 font-bold text-canvas">Explorar coleção <ArrowRight className="size-4" /></a></div>
        </div>
      </section>

      <section id="catalog" className="page-shell scroll-mt-28 pt-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Marketplace</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Coleções em destaque</h2></div><p className="text-sm text-muted" aria-live="polite">{query.data ? `${query.data.meta.total} itens encontrados` : 'Carregando catálogo'}</p></div>
        <form className="surface mb-8 grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-8" onSubmit={(event) => { event.preventDefault(); applySearchAndPrice() }}>
          <label className="relative sm:col-span-2"><span className="sr-only">Buscar NFTs</span><Search className="pointer-events-none absolute left-4 top-3.5 size-4 text-muted" /><Input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Buscar NFT, coleção ou criador" className="pl-11" /></label>
          <label><span className="sr-only">Coleção</span><Select value={search.collection ?? ''} onChange={(event) => setSearch({ collection: event.target.value || undefined })}><option value="">Todas as coleções</option>{query.data?.filters.collections.map((collection) => <option key={collection} value={collection}>{collection}</option>)}</Select></label>
          <label><span className="sr-only">Disponibilidade</span><Select value={search.availability ?? ''} onChange={(event) => setSearch({ availability: (event.target.value || undefined) as HomeSearch['availability'] })}><option value="">Toda disponibilidade</option><option value="available">Disponível</option><option value="sold-out">Esgotado</option></Select></label>
          <label><span className="sr-only">Preço mínimo em ETH</span><Input type="number" min="0" step="any" inputMode="decimal" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Mín. ETH" aria-describedby={priceError ? 'price-range-error' : undefined} /></label>
          <label><span className="sr-only">Preço máximo em ETH</span><Input type="number" min="0" step="any" inputMode="decimal" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Máx. ETH" aria-describedby={priceError ? 'price-range-error' : undefined} /></label>
          <label><span className="sr-only">Ordenar por</span><Select value={currentSort} onChange={(event) => setSearch({ sort: event.target.value as NftSort })}><option value="featured">Destaques</option><option value="newest">Mais recentes</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option></Select></label>
          <Button type="submit"><SlidersHorizontal className="size-4" /> Aplicar</Button>
          {priceError ? <div id="price-range-error" className="sm:col-span-2 xl:col-span-8"><InlineMessage tone="error">{priceError}</InlineMessage></div> : null}
        </form>

        {query.isLoading ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Carregando NFTs">{Array.from({ length: 6 }, (_, index) => <div className="surface overflow-hidden" key={index}><Skeleton className="aspect-[4/4.6] rounded-none" /><div className="space-y-3 p-5"><Skeleton className="h-3 w-24" /><Skeleton className="h-6 w-3/4" /><Skeleton className="mt-6 h-5 w-28" /></div></div>)}</div> : null}
        {query.isError ? <ErrorState message={query.error.message} onRetry={() => void query.refetch()} /> : null}
        {query.data && query.data.items.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{query.data.items.map((nft) => <NftCard key={nft.id} nft={nft} />)}</div> : null}
        {query.data && !query.data.items.length ? <div className="surface grid min-h-64 place-items-center p-8 text-center"><div><Search className="mx-auto mb-4 size-9 text-muted" /><h3 className="text-xl font-bold">Nada encontrado</h3><p className="mt-2 text-muted">Tente uma busca mais ampla ou limpe os filtros.</p><Button className="mt-5" onClick={() => void navigate({ search: {} })}>Limpar filtros</Button></div></div> : null}
        {query.data && query.data.meta.totalPages > 1 ? <nav aria-label="Paginação" className="mt-10 flex items-center justify-center gap-3"><Button variant="secondary" disabled={currentPage <= 1} onClick={() => setSearch({ page: currentPage - 1 }, false)}>Anterior</Button><span className="text-sm text-muted">Página {currentPage} de {query.data.meta.totalPages}</span><Button variant="secondary" disabled={currentPage >= query.data.meta.totalPages} onClick={() => setSearch({ page: currentPage + 1 }, false)}>Próxima</Button></nav> : null}
      </section>
    </div>
  )
}
