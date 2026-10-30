import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { CheckCircle2, LoaderCircle, ShieldCheck, WalletCards } from 'lucide-react'
import type { Network } from '@/api/contracts'
import { cartApi, ordersApi, walletsApi } from '@/api/client/api'
import { queryKeys } from '@/api/query-keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { InlineMessage } from '@/components/feedback/inline-message'
import { useAuth } from '@/features/auth/auth-context'
import { formatEth } from '@/lib/money'
import { shortAddress } from '@/lib/utils'

export function CheckoutPage() {
  const { session } = useAuth(); const userId = session?.user.id ?? ''; const navigate = useNavigate(); const client = useQueryClient()
  const quote = useQuery({ queryKey: queryKeys.quote(userId), queryFn: ({ signal }) => cartApi.quote(signal), staleTime: 5_000, retry: false, refetchOnWindowFocus: false })
  const wallets = useQuery({ queryKey: queryKeys.wallets(userId), queryFn: ({ signal }) => walletsApi.list(signal) })
  const [network, setNetwork] = useState<Network>('ethereum'); const [walletId, setWalletId] = useState(''); const [reviewedQuoteId, setReviewedQuoteId] = useState(''); const [collector, setCollector] = useState({ fullName: session?.user.name ?? '', email: session?.user.email ?? '', country: 'Brasil' })
  const [quoteChanged, setQuoteChanged] = useState(false)
  const compatible = useMemo(() => wallets.data?.filter((wallet) => wallet.network === network) ?? [], [network, wallets.data])
  const selectedWallet = compatible.find((wallet) => wallet.id === walletId) ?? compatible.find((wallet) => wallet.primary) ?? compatible[0]
  const currentQuoteId = quote.data?.id
  const [trackedQuoteId, setTrackedQuoteId] = useState<string | undefined>(currentQuoteId)
  if (currentQuoteId !== trackedQuoteId) {
    setTrackedQuoteId(currentQuoteId)
    if (trackedQuoteId) setQuoteChanged(true)
    setReviewedQuoteId('')
  }
  const connect = useMutation({ mutationFn: ({ id, connected }: { id: string; connected: boolean }) => walletsApi.update(id, { connected }), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.wallets(userId) }) })
  const create = useMutation({
    mutationFn: async () => {
      if (!quote.data || !selectedWallet) throw new Error('Cotação ou carteira indisponível.')
      const storageKey = `jungle:idempotency:${quote.data.id}`
      let key = sessionStorage.getItem(storageKey)
      if (!key) { key = crypto.randomUUID(); sessionStorage.setItem(storageKey, key) }
      return ordersApi.create({ quoteId: quote.data.id, walletId: selectedWallet.id, network, collector }, key)
    },
    onSuccess: async (order) => { client.setQueryData(queryKeys.order(userId, order.id), order); await navigate({ to: '/orders/$orderId', params: { orderId: order.id } }) },
  })
  const review = (event: FormEvent) => { event.preventDefault(); if (quote.data) { setReviewedQuoteId(quote.data.id); setQuoteChanged(false) } }
  if (quote.isLoading || wallets.isLoading) return <div className="page-shell py-12"><Skeleton className="h-12 w-72" /><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_24rem]"><Skeleton className="h-[34rem]" /><Skeleton className="h-96" /></div></div>
  if (quote.isError) return <div className="page-shell py-12"><InlineMessage tone="error">{quote.error.message}</InlineMessage><Button className="mt-4" onClick={() => void quote.refetch()}>Gerar nova cotação</Button></div>
  if (!quote.data) return null
  const reviewed = reviewedQuoteId === quote.data.id
  return <div className="page-shell py-12"><p className="eyebrow">Pagamento simulado</p><h1 className="mt-2 text-4xl font-black">Finalizar compra</h1><div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_24rem]"><form onSubmit={review} className="space-y-6"><section className="surface p-5 sm:p-7"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-accent text-canvas">1</span><h2 className="text-xl font-bold">Dados do colecionador</h2></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label><span className="field-label">Nome completo</span><Input required value={collector.fullName} onChange={(event) => setCollector((value) => ({ ...value, fullName: event.target.value }))} /></label><label><span className="field-label">E-mail</span><Input required type="email" value={collector.email} onChange={(event) => setCollector((value) => ({ ...value, email: event.target.value }))} /></label><label className="sm:col-span-2"><span className="field-label">País</span><Input required value={collector.country} onChange={(event) => setCollector((value) => ({ ...value, country: event.target.value }))} /></label></div></section><section className="surface p-5 sm:p-7"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-accent text-canvas">2</span><h2 className="text-xl font-bold">Carteira e rede</h2></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label><span className="field-label">Rede</span><Select value={network} onChange={(event) => { setNetwork(event.target.value as Network); setWalletId('') }}><option value="ethereum">Ethereum</option><option value="polygon">Polygon</option></Select></label><label><span className="field-label">Carteira</span><Select value={selectedWallet?.id ?? ''} onChange={(event) => setWalletId(event.target.value)} disabled={!compatible.length}><option value="">Selecione</option>{compatible.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.label} · {shortAddress(wallet.address)}</option>)}</Select></label></div>{selectedWallet ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-panel-raised p-4"><div><p className="font-bold">{selectedWallet.label}</p><p className="text-sm text-muted">{shortAddress(selectedWallet.address)} · {selectedWallet.connected ? 'Conectada' : 'Desconectada'}</p></div><Button type="button" variant="secondary" onClick={() => connect.mutate({ id: selectedWallet.id, connected: !selectedWallet.connected })}>{selectedWallet.connected ? 'Desconectar' : 'Conectar simulação'}</Button></div> : <InlineMessage tone="warning">Cadastre uma carteira compatível antes de continuar.</InlineMessage>}</section><Button type="submit" className="w-full sm:w-auto" disabled={!selectedWallet?.connected}><ShieldCheck className="size-4" /> Revisar pedido</Button></form><aside className="surface sticky top-28 p-5"><h2 className="text-xl font-bold">Sua cotação</h2><p className="mt-1 text-xs text-muted">Válida até {new Date(quote.data.expiresAt).toLocaleTimeString('pt-BR')}</p>{quoteChanged ? <div className="mt-4"><InlineMessage tone="warning">A cotação mudou em tempo real. Revise os novos valores antes de confirmar.</InlineMessage></div> : null}<ul className="mt-5 space-y-4">{quote.data.lines.map((line) => <li key={line.cartItemId} className="flex gap-3"><img src={line.imageUrl} alt="" className="size-14 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{line.name}</p><p className="text-xs text-muted">{line.quantity} × {formatEth(line.unitPriceEth)}</p></div><span className="text-sm font-bold">{formatEth(line.lineTotalEth)}</span></li>)}</ul><dl className="mt-5 space-y-2 border-t pt-5 text-sm"><Summary label="Subtotal" value={formatEth(quote.data.subtotalEth)} /><Summary label="Desconto" value={`− ${formatEth(quote.data.discountEth)}`} /><Summary label="Taxa de rede" value={formatEth(quote.data.networkFeeEth)} /><div className="pt-3 text-base font-black"><Summary label="Total" value={formatEth(quote.data.totalEth)} /></div></dl>{reviewed ? <div className="mt-5 space-y-3"><InlineMessage tone="success"><span className="flex items-center gap-2"><CheckCircle2 className="size-4" /> Cotação revisada. Confirme a simulação.</span></InlineMessage><Button className="w-full" disabled={create.isPending || !selectedWallet?.connected} onClick={() => create.mutate()}>{create.isPending ? <><LoaderCircle className="size-4 animate-spin" /> Processando…</> : <><WalletCards className="size-4" /> Confirmar compra</>}</Button></div> : <p className="mt-5 rounded-xl bg-white/5 p-3 text-xs leading-5 text-muted">Revise os dados e a cotação. Qualquer mudança de preço exige nova revisão.</p>}{create.isError ? <div className="mt-3"><InlineMessage tone="error">{create.error.message} Tente novamente: a mesma chave recuperará o pedido sem duplicar.</InlineMessage></div> : null}</aside></div></div>
}

function Summary({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4"><dt className="text-muted">{label}</dt><dd>{value}</dd></div> }
