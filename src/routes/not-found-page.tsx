import { Link } from '@tanstack/react-router'
import { Compass } from 'lucide-react'

export function NotFoundPage() {
  return <div className="page-shell grid min-h-[65vh] place-items-center py-12 text-center"><div><Compass className="mx-auto size-14 text-accent" /><p className="eyebrow mt-5">404</p><h1 className="mt-2 text-4xl font-black">Trilha não encontrada</h1><p className="mt-3 text-muted">A página que você procura não existe nesta selva.</p><Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-canvas">Voltar ao marketplace</Link></div></div>
}
