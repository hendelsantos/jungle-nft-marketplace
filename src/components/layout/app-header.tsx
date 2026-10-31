import { Link } from '@tanstack/react-router'
import { Heart, Menu, ShoppingBag, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'
import { useCart } from '@/features/cart/queries'

const nav = [
  { to: '/', label: 'Marketplace' },
  { to: '/profile', label: 'Perfil' },
  { to: '/wallets', label: 'Carteiras' },
] as const

export function AppHeader() {
  const [open, setOpen] = useState(false)
  const { session, logout } = useAuth()
  const cart = useCart()
  const count = cart.data?.items.reduce((total, item) => total + item.quantity, 0) ?? 0
  return (
    <header className="sticky top-0 z-40 border-b bg-canvas/90 backdrop-blur-xl">
      <a href="#main-content" className="absolute left-3 top-3 -translate-y-20 rounded-md bg-accent px-4 py-2 font-bold text-canvas focus:translate-y-0">Pular para o conteúdo</a>
      <div className="page-shell flex min-h-20 items-center gap-4">
        <Link to="/" className="mr-auto flex items-center gap-2" aria-label="Jungle, início">
          <span className="grid size-9 place-items-center rounded-md border border-accent/50 bg-accent/10 text-lg font-black text-accent">J</span>
          <span className="text-base font-black tracking-[0.14em]">JUNGLE<span className="text-accent">.</span></span>
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => <Link key={item.to} to={item.to} className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:bg-white/5 hover:text-ink" activeProps={{ className: 'text-ink bg-white/5' }}>{item.label}</Link>)}
        </nav>
        <div className="flex items-center gap-1">
          {session ? <Link to="/favorites" aria-label="Favoritos" className="grid size-11 place-items-center rounded-full hover:bg-white/10"><Heart className="size-5" /></Link> : null}
          <Link to="/cart" aria-label={`Carrinho com ${count} itens`} className="relative grid size-11 place-items-center rounded-full hover:bg-white/10"><ShoppingBag className="size-5" />{count > 0 ? <span className="absolute -right-0.5 top-0 grid size-5 place-items-center rounded-full bg-accent text-[10px] font-black text-canvas">{count}</span> : null}</Link>
          {session ? (
            <Button variant="secondary" className="hidden sm:inline-flex" onClick={() => void logout()}><UserRound className="size-4" /> Sair</Button>
          ) : <Link to="/login" className="hidden min-h-11 items-center rounded-full bg-accent px-5 text-sm font-bold text-canvas sm:inline-flex">Entrar</Link>}
          <Button variant="ghost" size="icon" className="lg:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</Button>
        </div>
      </div>
      {open ? <nav id="mobile-menu" aria-label="Mobile" className="page-shell grid gap-1 border-t py-3 lg:hidden">{nav.map((item) => <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 font-semibold text-muted" activeProps={{ className: 'bg-white/5 text-ink' }}>{item.label}</Link>)}{session ? <button className="rounded-xl px-4 py-3 text-left font-semibold text-muted" onClick={() => void logout()}>Sair</button> : <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 font-semibold text-accent">Entrar</Link>}</nav> : null}
    </header>
  )
}
