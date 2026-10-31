import Decimal from 'decimal.js'
import { Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import type { Nft } from '@/api/contracts'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'
import { useFavorites, useToggleFavorite } from '@/features/favorites/queries'
import { formatEth } from '@/lib/money'
import { cn } from '@/lib/utils'

export function NftCard({ nft }: { nft: Nft }) {
  const { session } = useAuth()
  const favorites = useFavorites()
  const toggle = useToggleFavorite()
  const active = favorites.data?.nftIds.includes(nft.id) ?? false
  const available = nft.editions.some((edition) => edition.available > 0)
  const lowest = Decimal.min(...nft.editions.map((edition) => edition.priceEth)).toString()
  return (
    <article className="group surface overflow-hidden transition hover:-translate-y-1 hover:border-accent/40">
      <div className="relative aspect-square overflow-hidden bg-panel-raised">
        <Link to="/nfts/$nftId" params={{ nftId: nft.id }} aria-label={`Ver ${nft.name}`}><img src={nft.imageUrl} alt={`Arte de ${nft.name}`} width="800" height="900" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /></Link>
        <span className={cn('absolute left-3 top-3 rounded-full border bg-canvas/85 px-3 py-1 text-xs font-bold backdrop-blur', available ? 'text-accent' : 'text-muted')}>{available ? 'Disponível' : 'Esgotado'}</span>
        <Button size="icon" variant="secondary" className="absolute right-3 top-3 bg-canvas/85" aria-label={active ? `Remover ${nft.name} dos favoritos` : `Adicionar ${nft.name} aos favoritos`} aria-pressed={active} disabled={!session || toggle.isPending} onClick={() => toggle.mutate({ nftId: nft.id, active })} title={session ? undefined : 'Entre para favoritar'}><Heart className={cn('size-5', active && 'fill-red-400 text-red-400')} /></Button>
      </div>
      <div className="p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{nft.collection}</p>
        <Link to="/nfts/$nftId" params={{ nftId: nft.id }} className="mt-1 block text-lg font-bold hover:text-accent">{nft.name}</Link>
        <div className="mt-4 flex items-end justify-between gap-3"><div><p className="text-xs text-muted">A partir de</p><p className="mt-1 font-bold">{formatEth(lowest)}</p></div><span className="text-xs text-muted">v{nft.version}</span></div>
      </div>
    </article>
  )
}
