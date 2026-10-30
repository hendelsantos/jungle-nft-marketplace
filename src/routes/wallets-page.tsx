import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Link2, Pencil, Plus, Trash2, Unplug } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { Network, Wallet, WalletInput } from '@/api/contracts'
import { walletsApi } from '@/api/client/api'
import { queryKeys } from '@/api/query-keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { InlineMessage } from '@/components/feedback/inline-message'
import { useAuth } from '@/features/auth/auth-context'
import { shortAddress } from '@/lib/utils'
import { field } from '@/lib/form'

export function WalletsPage() {
  const { session } = useAuth()
  const userId = session?.user.id ?? ''
  const client = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string>()
  const key = queryKeys.wallets(userId)
  const query = useQuery({ queryKey: key, queryFn: ({ signal }) => walletsApi.list(signal) })
  const refresh = () => client.invalidateQueries({ queryKey: key })
  const create = useMutation({ mutationFn: walletsApi.create, onSuccess: () => { setOpen(false); void refresh() } })
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof walletsApi.update>[1] }) => walletsApi.update(id, input),
    onSuccess: () => { setEditingId(undefined); void refresh() },
  })
  const remove = useMutation({ mutationFn: walletsApi.remove, onSuccess: refresh })

  const submitCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    create.mutate({
      label: field(form, 'label'),
      address: field(form, 'address'),
      network: field(form, 'network') as Network,
      primary: form.get('primary') === 'on',
    } satisfies WalletInput)
  }

  const submitEdit = (event: FormEvent<HTMLFormElement>, wallet: Wallet) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    update.mutate({ id: wallet.id, input: { label: field(form, 'label'), address: field(form, 'address'), network: field(form, 'network') as Network } })
  }

  return (
    <div className="page-shell py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Conta</p><h1 className="mt-2 text-4xl font-black">Carteiras</h1><p className="mt-2 text-muted">Conexões são simuladas; nenhuma carteira real será acessada.</p></div>
        <Button onClick={() => setOpen((value) => !value)}><Plus className="size-4" /> Nova carteira</Button>
      </div>
      {query.isError ? <div className="mt-6"><InlineMessage tone="error">{query.error.message}</InlineMessage></div> : null}
      {open ? (
        <section className="surface mt-8 p-5">
          <h2 className="text-xl font-bold">Cadastrar carteira</h2>
          <form onSubmit={submitCreate} className="mt-5 grid gap-4 md:grid-cols-2">
            <label><span className="field-label">Nome</span><Input name="label" placeholder="Minha carteira" required /></label>
            <label><span className="field-label">Rede</span><Select name="network"><option value="ethereum">Ethereum</option><option value="polygon">Polygon</option></Select></label>
            <label className="md:col-span-2"><span className="field-label">Endereço</span><Input name="address" placeholder="0x…" pattern="0x[a-fA-F0-9]{40}" required /></label>
            <label className="flex items-center gap-2 text-sm"><input name="primary" type="checkbox" className="size-4 accent-lime-300" /> Definir como principal</label>
            <div className="md:text-right"><Button type="submit" disabled={create.isPending}>{create.isPending ? 'Salvando…' : 'Salvar carteira'}</Button></div>
            {create.isError ? <div className="md:col-span-2"><InlineMessage tone="error">{create.error.message}</InlineMessage></div> : null}
          </form>
        </section>
      ) : null}
      <section aria-label="Carteiras cadastradas" className="mt-8 grid gap-4 md:grid-cols-2">
        {query.data?.map((wallet) => (
          <article className="surface p-5" key={wallet.id}>
            <div className="flex items-start justify-between gap-4">
              <div><div className="flex items-center gap-2"><h2 className="font-bold">{wallet.label}</h2>{wallet.primary ? <span className="rounded-full bg-accent/10 px-2 py-1 text-[10px] font-bold uppercase text-accent">Principal</span> : null}</div><p className="mt-2 font-mono text-sm text-muted">{shortAddress(wallet.address)}</p><p className="mt-1 text-xs uppercase tracking-wider text-muted">{wallet.network}</p></div>
              {wallet.connected ? <CheckCircle2 className="size-5 text-emerald-300" aria-label="Conectada" /> : null}
            </div>
            {editingId === wallet.id ? (
              <form className="mt-5 space-y-3 rounded-xl border bg-panel-raised p-4" onSubmit={(event) => submitEdit(event, wallet)}>
                <label><span className="field-label">Nome</span><Input name="label" defaultValue={wallet.label} required /></label>
                <label><span className="field-label">Endereço</span><Input name="address" defaultValue={wallet.address} pattern="0x[a-fA-F0-9]{40}" required /></label>
                <label><span className="field-label">Rede</span><Select name="network" defaultValue={wallet.network}><option value="ethereum">Ethereum</option><option value="polygon">Polygon</option></Select></label>
                <div className="flex gap-2"><Button size="sm" type="submit" disabled={update.isPending}>Salvar edição</Button><Button size="sm" type="button" variant="ghost" onClick={() => setEditingId(undefined)}>Cancelar</Button></div>
                {update.isError ? <InlineMessage tone="error">{update.error.message}</InlineMessage> : null}
              </form>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => update.mutate({ id: wallet.id, input: { connected: !wallet.connected } })}>{wallet.connected ? <Unplug className="size-4" /> : <Link2 className="size-4" />}{wallet.connected ? 'Desconectar' : 'Conectar'}</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingId(wallet.id)}><Pencil className="size-4" /> Editar</Button>
              {!wallet.primary ? <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: wallet.id, input: { primary: true } })}>Tornar principal</Button> : null}
              <Button size="sm" variant="danger" aria-label={`Remover ${wallet.label}`} onClick={() => remove.mutate(wallet.id)}><Trash2 className="size-4" /></Button>
            </div>
          </article>
        ))}
        {query.data && !query.data.length ? <div className="surface grid min-h-56 place-items-center text-center md:col-span-2"><div><Link2 className="mx-auto mb-3 size-9 text-muted" /><h2 className="font-bold">Nenhuma carteira cadastrada</h2></div></div> : null}
      </section>
    </div>
  )
}
