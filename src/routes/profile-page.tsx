import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { InlineMessage } from '@/components/feedback/inline-message'
import { ErrorState } from '@/components/feedback/error-state'
import { profileApi } from '@/api/client/api'
import { queryKeys } from '@/api/query-keys'
import { useAuth } from '@/features/auth/auth-context'
import { field } from '@/lib/form'

export function ProfilePage() {
  const { session } = useAuth(); const client = useQueryClient(); const userId = session?.user.id ?? ''
  const query = useQuery({ queryKey: queryKeys.profile(userId), queryFn: ({ signal }) => profileApi.get(signal) })
  const update = useMutation({ mutationFn: profileApi.update, onSuccess: (profile) => client.setQueryData(queryKeys.profile(userId), profile) })
  const password = useMutation({ mutationFn: profileApi.password })
  if (query.isLoading) return <div className="page-shell py-12"><Skeleton className="h-[32rem]" /></div>
  if (query.isError) return <div className="page-shell py-12"><ErrorState message={query.error.message} onRetry={() => void query.refetch()} /></div>
  if (!query.data) return null
  const submitProfile = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const avatarUrl = field(form, 'avatarUrl'); update.mutate({ name: field(form, 'name'), bio: field(form, 'bio'), country: field(form, 'country'), ...(avatarUrl ? { avatarUrl } : {}) }) }
  const submitPassword = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement); password.mutate({ currentPassword: field(form, 'currentPassword'), newPassword: field(form, 'newPassword'), confirmPassword: field(form, 'confirmPassword') }, { onSuccess: () => formElement.reset() }) }
  return <div className="page-shell py-12"><p className="eyebrow">Conta</p><h1 className="mt-2 text-4xl font-black">Perfil do colecionador</h1><div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_0.8fr]"><section className="surface p-5 sm:p-7"><div className="mb-6 flex items-center gap-4"><img src={query.data.avatarUrl ?? '/assets/avatar-ana.svg'} alt={`Avatar de ${query.data.name}`} className="size-20 rounded-full border object-cover" /><div><h2 className="text-xl font-bold">Dados pessoais</h2><p className="text-sm text-muted">Visíveis somente nesta demonstração.</p></div></div><form onSubmit={submitProfile} className="space-y-4"><FormField label="Nome" name="name" defaultValue={query.data.name} /><FormField label="E-mail" name="email" value={query.data.email} disabled /><FormField label="País" name="country" defaultValue={query.data.country} /><label><span className="field-label">Bio</span><textarea name="bio" defaultValue={query.data.bio} maxLength={240} className="min-h-28 w-full rounded-xl border bg-panel-raised p-4 text-sm" /></label><label><span className="field-label">Avatar</span><select name="avatarUrl" defaultValue={query.data.avatarUrl} className="min-h-11 w-full rounded-xl border bg-panel-raised px-4"><option value="/assets/avatar-ana.svg">Exploradora violeta</option><option value="/assets/avatar-caio.svg">Colecionador ciano</option></select></label>{update.isSuccess ? <InlineMessage tone="success">Perfil salvo.</InlineMessage> : null}{update.isError ? <InlineMessage tone="error">{update.error.message}</InlineMessage> : null}<Button type="submit" disabled={update.isPending}>{update.isPending ? 'Salvando…' : 'Salvar alterações'}</Button></form></section><section className="surface p-5 sm:p-7"><h2 className="text-xl font-bold">Alterar senha</h2><p className="mt-1 text-sm text-muted">A senha é armazenada somente como hash no mock.</p><form onSubmit={submitPassword} className="mt-6 space-y-4"><FormField label="Senha atual" name="currentPassword" type="password" autoComplete="current-password" /><FormField label="Nova senha" name="newPassword" type="password" minLength={8} autoComplete="new-password" /><FormField label="Confirmar nova senha" name="confirmPassword" type="password" minLength={8} autoComplete="new-password" />{password.isSuccess ? <InlineMessage tone="success">Senha alterada.</InlineMessage> : null}{password.isError ? <InlineMessage tone="error">{password.error.message}</InlineMessage> : null}<Button variant="secondary" type="submit" disabled={password.isPending}>{password.isPending ? 'Alterando…' : 'Alterar senha'}</Button></form></section></div></div>
}

function FormField({ label, name, ...props }: React.ComponentProps<typeof Input> & { label: string; name: string }) { return <label><span className="field-label">{label}</span><Input name={name} required {...props} /></label> }
