import { Link } from '@tanstack/react-router'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { InlineMessage } from '@/components/feedback/inline-message'
import { ErrorState } from '@/components/feedback/error-state'
import { useAuth } from '@/features/auth/auth-context'
import { useCart, useCartActions } from '@/features/cart/queries'
import { addEth, formatEth, multiplyEth, percentOfEth, subtractEth } from '@/lib/money'

export function CartPage() {
  const query = useCart()
  const actions = useCartActions()
  const { session } = useAuth()
  const [coupon, setCoupon] = useState('')
  const totals = useMemo(() => {
    const subtotal = addEth(...(query.data?.items.map((item) => {
      const edition = item.nft.editions.find((candidate) => candidate.id === item.editionId)
      return multiplyEth(edition?.priceEth ?? '0', item.quantity)
    }) ?? []))
    const discount = query.data?.couponCode === 'JUNGLE10' ? percentOfEth(subtotal, '10') : '0'
    const fee = percentOfEth(subtractEth(subtotal, discount), '1.5')
    return { subtotal, discount, fee, total: addEth(subtractEth(subtotal, discount), fee) }
  }, [query.data])
  if (query.isLoading) return <div className="page-shell py-12"><Skeleton className="h-12 w-64" /><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_24rem]"><Skeleton className="h-96" /><Skeleton className="h-80" /></div></div>
  if (query.isError) return <div className="page-shell py-12"><ErrorState message={query.error.message} onRetry={() => void query.refetch()} /></div>
  const cart = query.data
  return (
    <div className="page-shell py-12"><p className="eyebrow">Sua seleção</p><h1 className="mt-2 text-4xl font-black">Carrinho</h1>
      {!cart?.items.length ? <div className="surface mt-8 grid min-h-80 place-items-center text-center"><div><ShoppingBag className="mx-auto mb-4 size-12 text-muted" /><h2 className="text-2xl font-bold">Sua mochila está vazia</h2><p className="mt-2 text-muted">Explore o marketplace e escolha sua próxima peça.</p><Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-canvas">Explorar NFTs</Link></div></div> :
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section aria-label="Itens do carrinho" className="space-y-4">{cart.items.map((item) => {
          const edition = item.nft.editions.find((candidate) => candidate.id === item.editionId)
          const changed = item.catalogVersion !== item.nft.version
          return <article key={item.id} className="surface grid grid-cols-[6rem_1fr] gap-4 p-4 sm:grid-cols-[8rem_1fr_auto]"><img src={item.nft.imageUrl} alt="" className="aspect-square w-full rounded-xl object-cover" /><div><p className="text-xs font-bold uppercase tracking-wider text-muted">{item.nft.collection} · {edition?.label}</p><Link to="/nfts/$nftId" params={{ nftId: item.nft.id }} className="mt-1 block text-lg font-bold hover:text-accent">{item.nft.name}</Link><p className="mt-2 font-bold">{formatEth(edition?.priceEth ?? '0')}</p>{changed ? <p className="mt-2 text-sm text-amber-200" role="status">Preço ou disponibilidade atualizado.</p> : null}<div className="mt-4 flex items-center gap-2 sm:hidden"><Quantity itemId={item.id} value={item.quantity} max={edition?.available ?? 0} onChange={(quantity) => actions.update.mutate({ itemId: item.id, quantity })} /><Button variant="danger" size="icon" aria-label={`Remover ${item.nft.name}`} onClick={() => actions.remove.mutate(item.id)}><Trash2 className="size-4" /></Button></div></div><div className="hidden items-center gap-2 sm:flex"><Quantity itemId={item.id} value={item.quantity} max={edition?.available ?? 0} onChange={(quantity) => actions.update.mutate({ itemId: item.id, quantity })} /><Button variant="danger" size="icon" aria-label={`Remover ${item.nft.name}`} onClick={() => actions.remove.mutate(item.id)}><Trash2 className="size-4" /></Button></div></article>
        })}</section>
        <aside className="surface sticky top-28 p-5"><h2 className="text-xl font-bold">Resumo</h2><form className="mt-5 flex gap-2" onSubmit={(event) => { event.preventDefault(); actions.coupon.mutate(coupon) }}><label className="flex-1"><span className="sr-only">Cupom</span><Input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Cupom" /></label><Button variant="secondary" type="submit">Aplicar</Button></form>{cart.couponCode ? <div className="mt-3 flex items-center justify-between rounded-xl bg-accent/10 px-3 py-2 text-sm text-accent"><span>{cart.couponCode} aplicado</span><button onClick={() => actions.coupon.mutate(null)} className="font-bold underline">Remover</button></div> : null}{actions.coupon.isError ? <div className="mt-3"><InlineMessage tone="error">{actions.coupon.error.message}</InlineMessage></div> : null}<dl className="mt-6 space-y-3 text-sm"><Row label="Subtotal" value={formatEth(totals.subtotal)} /><Row label="Desconto" value={`− ${formatEth(totals.discount)}`} /><Row label="Taxa estimada" value={formatEth(totals.fee)} /><div className="border-t pt-4"><Row label="Total estimado" value={formatEth(totals.total)} strong /></div></dl>{session ? <Link to="/checkout" className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-accent px-5 font-bold text-canvas">Ir para pagamento</Link> : <Link to="/login" search={{ redirect: '/checkout' }} className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-accent px-5 text-center font-bold text-canvas">Entrar para finalizar</Link>}<p className="mt-3 text-xs leading-5 text-muted">A cotação final será validada pela API antes da compra.</p></aside>
      </div>}
    </div>
  )
}

function Quantity({ itemId, value, max, onChange }: { itemId: string; value: number; max: number; onChange: (value: number) => void }) {
  return <div className="flex items-center gap-1" aria-label="Quantidade"><Button variant="secondary" size="icon" className="size-9 min-h-9" disabled={value <= 1} aria-label={`Diminuir quantidade do item ${itemId}`} onClick={() => onChange(value - 1)}><Minus className="size-3" /></Button><output className="w-8 text-center font-bold">{value}</output><Button variant="secondary" size="icon" className="size-9 min-h-9" disabled={value >= max} aria-label={`Aumentar quantidade do item ${itemId}`} onClick={() => onChange(value + 1)}><Plus className="size-3" /></Button></div>
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex justify-between gap-4 ${strong ? 'text-base font-black' : 'text-muted'}`}><dt>{label}</dt><dd className={strong ? '' : 'text-ink'}>{value}</dd></div>
}
