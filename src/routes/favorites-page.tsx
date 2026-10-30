import { Heart } from 'lucide-react'
import { useFavorites } from '@/features/favorites/queries'
import { useNfts } from '@/features/catalog/queries'
import { NftCard } from '@/features/catalog/nft-card'
import { Skeleton } from '@/components/ui/skeleton'

export function FavoritesPage() {
  const favorites = useFavorites()
  const catalog = useNfts({ page: 1, pageSize: 12 })
  const items = catalog.data?.items.filter((nft) => favorites.data?.nftIds.includes(nft.id)) ?? []
  return <div className="page-shell py-12"><p className="eyebrow">Sua curadoria</p><h1 className="mt-2 text-4xl font-black">Favoritos</h1>{favorites.isLoading || catalog.isLoading ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="aspect-[4/5.5]" />)}</div> : items.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((nft) => <NftCard key={nft.id} nft={nft} />)}</div> : <div className="surface mt-8 grid min-h-64 place-items-center text-center"><div><Heart className="mx-auto mb-4 size-10 text-muted" /><h2 className="text-xl font-bold">Nenhum favorito ainda</h2><p className="mt-2 text-muted">Marque NFTs para encontrá-los aqui.</p></div></div>}</div>
}
