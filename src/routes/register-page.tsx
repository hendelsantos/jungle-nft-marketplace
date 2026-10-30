import { Link, useSearch } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { InlineMessage } from '@/components/feedback/inline-message'
import { useAuth } from '@/features/auth/auth-provider'
import { AuthShell, Field } from './login-page'

export function RegisterPage() {
  const { register } = useAuth(); const search = useSearch({ strict: false }) as { redirect?: string }
  const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setBusy(true); setError(''); const form = new FormData(event.currentTarget); try { await register({ name: String(form.get('name')), email: String(form.get('email')), password: String(form.get('password')), confirmPassword: String(form.get('confirmPassword')) }); window.location.assign(search.redirect ?? '/') } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível criar a conta.') } finally { setBusy(false) } }
  return <AuthShell title="Crie sua conta" subtitle="Entre na Jungle com credenciais fictícias."><form onSubmit={(event) => void submit(event)} className="space-y-4"><Field label="Nome" name="name" autoComplete="name" /><Field label="E-mail" name="email" type="email" autoComplete="email" /><Field label="Senha" name="password" type="password" minLength={8} autoComplete="new-password" /><Field label="Confirmar senha" name="confirmPassword" type="password" minLength={8} autoComplete="new-password" />{error ? <InlineMessage tone="error">{error}</InlineMessage> : null}<Button className="w-full" type="submit" disabled={busy}>{busy ? 'Criando…' : 'Criar conta'}</Button></form><p className="mt-6 text-center text-sm text-muted">Já tem conta? <Link to="/login" search={search.redirect ? { redirect: search.redirect } : {}} className="font-bold text-accent">Entrar</Link></p></AuthShell>
}
