import { useMemo, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { Check, Heart, Minus, Plus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/feedback/error-state'
import { InlineMessage } from '@/components/feedback/inline-message'
import { useNft } from '@/features/catalog/queries'
import { useAuth } from '@/features/auth/auth-context'
import { useCartActions } from '@/features/cart/queries'
import { useFavorites, useToggleFavorite } from '@/features/favorites/queries'
import { formatEth } from '@/lib/money'
import { cn } from '@/lib/utils'

export function NftDetailPage() {
  const { nftId } = useParams({ from: '/nfts/$nftId' })
  const query = useNft(nftId)
  const { session } = useAuth()
  const favorites = useFavorites()
  const toggle = useToggleFavorite()
  const cart = useCartActions()
  const [editionId, setEditionId] = useState<string>()
  const [quantity, setQuantity] = useState(1)
  const nft = query.data
  const selected = useMemo(() => nft?.editions.find((edition) => edition.id === editionId) ?? nft?.editions.find((edition) => edition.available > 0) ?? nft?.editions[0], [editionId, nft])
  const active = favorites.data?.nftIds.includes(nft?.id ?? '') ?? false
  if (query.isLoading) return (
    <div className="page-shell py-8 sm:py-12" aria-busy="true" aria-label="Carregando NFT">
      <nav aria-hidden="true" className="mb-6 text-sm"><Skeleton className="h-4 w-40" /></nav>
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
        <div className="surface overflow-hidden"><Skeleton className="aspect-[4/4.6] w-full rounded-none" /></div>
        <section className="lg:py-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-12 w-4/5" />
          <Skeleton className="mt-3 h-4 w-44" />
          <Skeleton className="mt-6 h-20 w-full" />
          <div className="mt-8"><Skeleton className="h-4 w-32" /><div className="mt-3 grid gap-3 sm:grid-cols-2"><Skeleton className="h-[4.75rem]" /><Skeleton className="h-[4.75rem]" /></div></div>
          <Skeleton className="mt-6 h-24 w-full" />
          <div className="mt-5 flex gap-3"><Skeleton className="h-11 flex-1 rounded-full" /><Skeleton className="size-11 rounded-full" /></div>
          <div className="mt-10"><Skeleton className="h-5 w-28" /><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div></div>
        </section>
      </div>
    </div>
  )
  if (query.isError || !nft) return <div className="page-shell py-16"><ErrorState title="NFT não encontrado" message={query.error?.message ?? 'Este item não existe.'} /><Link to="/" className="mx-auto mt-6 block w-fit text-sm font-bold text-accent">Voltar ao marketplace</Link></div>
  return (
    <div className="page-shell py-8 sm:py-12">
      <nav aria-label="Navegação estrutural" className="mb-6 text-sm text-muted"><Link to="/" className="hover:text-ink">Marketplace</Link> <span aria-hidden="true">/</span> {nft.collection}</nav>
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
        <div className="surface relative overflow-hidden"><img src={nft.imageUrl} alt={`Arte de ${nft.name}`} width="800" height="900" className="aspect-[4/4.6] w-full object-cover" /><span className="absolute bottom-4 left-4 rounded-full bg-canvas/80 px-3 py-1 text-xs font-bold backdrop-blur">Atualização v{nft.version}</span></div>
        <section className="lg:py-4">
          <p className="eyebrow">{nft.collection}</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{nft.name}</h1><p className="mt-3 text-sm text-muted">Criado por <strong className="text-ink">{nft.creator}</strong></p><p className="mt-6 leading-7 text-muted">{nft.description}</p>
          <div className="mt-8"><p className="field-label">Escolha a edição</p><div className="grid gap-3 sm:grid-cols-2">{nft.editions.map((edition) => <button key={edition.id} disabled={!edition.available} onClick={() => { setEditionId(edition.id); setQuantity(1) }} className={cn('rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40', selected?.id === edition.id ? 'border-accent bg-accent/10' : 'bg-panel hover:border-muted')}><span className="flex items-center justify-between font-bold">{edition.label}{selected?.id === edition.id ? <Check className="size-4 text-accent" /> : null}</span><span className="mt-2 block text-sm text-muted">{formatEth(edition.priceEth)} · {edition.available} disponíveis</span></button>)}</div></div>
          {selected ? <div className="mt-6 flex flex-col gap-4 rounded-2xl border bg-panel p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm text-muted">Preço unitário</p><p className="mt-1 text-2xl font-black" aria-live="polite">{formatEth(selected.priceEth)}</p></div><div className="flex items-center gap-2"><Button variant="secondary" size="icon" aria-label="Diminuir quantidade" disabled={quantity <= 1} onClick={() => setQuantity((value) => value - 1)}><Minus className="size-4" /></Button><output className="w-10 text-center font-bold" aria-label={`Quantidade ${quantity}`}>{quantity}</output><Button variant="secondary" size="icon" aria-label="Aumentar quantidade" disabled={quantity >= selected.available} onClick={() => setQuantity((value) => value + 1)}><Plus className="size-4" /></Button></div></div> : null}
          {cart.add.isSuccess ? <div className="mt-4"><InlineMessage tone="success">Item adicionado ao carrinho.</InlineMessage></div> : null}
          {cart.add.isError ? <div className="mt-4"><InlineMessage tone="error">{cart.add.error.message}</InlineMessage></div> : null}
          <div className="mt-5 flex gap-3"><Button className="flex-1" disabled={!selected?.available || cart.add.isPending} onClick={() => selected && cart.add.mutate({ nftId: nft.id, editionId: selected.id, quantity })}><ShoppingBag className="size-4" />{cart.add.isPending ? 'Adicionando…' : 'Adicionar ao carrinho'}</Button><Button variant="secondary" size="icon" disabled={!session || toggle.isPending} aria-label={session ? (active ? 'Remover dos favoritos' : 'Adicionar aos favoritos') : 'Entre para favoritar'} aria-pressed={active} onClick={() => toggle.mutate({ nftId: nft.id, active })}><Heart className={cn('size-5', active && 'fill-red-400 text-red-400')} /></Button></div>
          <div className="mt-10"><h2 className="text-lg font-bold">Propriedades</h2><dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{nft.properties.map((property) => <div key={property.trait} className="rounded-xl border bg-panel p-4"><dt className="text-xs uppercase tracking-wide text-muted">{property.trait}</dt><dd className="mt-1 font-bold">{property.value}</dd></div>)}</dl></div>
        </section>
      </div>
    </div>
  )
}
