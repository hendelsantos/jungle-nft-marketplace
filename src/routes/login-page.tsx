import { Link, useSearch } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InlineMessage } from '@/components/feedback/inline-message'
import { useAuth } from '@/features/auth/auth-provider'

export function LoginPage() {
  const { login } = useAuth()
  const search = useSearch({ strict: false }) as { redirect?: string }
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError('')
    const form = new FormData(event.currentTarget)
    try { await login({ email: String(form.get('email')), password: String(form.get('password')) }); window.location.assign(search.redirect ?? '/') }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível entrar.') }
    finally { setBusy(false) }
  }
  return <AuthShell title="Bem-vindo de volta" subtitle="Entre para continuar sua coleção."><form onSubmit={(event) => void submit(event)} className="space-y-4"><Field label="E-mail" name="email" type="email" autoComplete="email" defaultValue="ana@jungle.demo" /><Field label="Senha" name="password" type="password" autoComplete="current-password" defaultValue="Jungle#2026" />{error ? <InlineMessage tone="error">{error}</InlineMessage> : null}<Button className="w-full" type="submit" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</Button></form><p className="mt-6 text-center text-sm text-muted">Ainda não tem conta? <Link to="/register" search={search.redirect ? { redirect: search.redirect } : {}} className="font-bold text-accent">Criar conta</Link></p></AuthShell>
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <div className="page-shell grid min-h-[70vh] place-items-center py-12"><section className="surface w-full max-w-md p-6 sm:p-8"><Link to="/" className="mb-8 inline-flex items-center gap-2 font-black"><span className="grid size-9 place-items-center rounded-lg bg-accent text-canvas">J</span>JUNGLE.</Link><h1 className="text-3xl font-black">{title}</h1><p className="mt-2 text-muted">{subtitle}</p><div className="mt-7">{children}</div></section></div>
}

export function Field({ label, name, ...props }: React.ComponentProps<typeof Input> & { label: string; name: string }) {
  return <label><span className="field-label">{label}</span><Input name={name} required {...props} /></label>
}
