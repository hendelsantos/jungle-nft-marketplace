import { cn } from '@/lib/utils'

export function InlineMessage({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'success' | 'warning' | 'error' }) {
  return <div role={tone === 'error' ? 'alert' : 'status'} aria-live="polite" className={cn('rounded-xl border px-4 py-3 text-sm', {
    'border-sky-400/30 bg-sky-400/10 text-sky-100': tone === 'info',
    'border-emerald-400/30 bg-emerald-400/10 text-emerald-100': tone === 'success',
    'border-amber-400/30 bg-amber-400/10 text-amber-100': tone === 'warning',
    'border-red-400/30 bg-red-400/10 text-red-100': tone === 'error',
  })}>{children}</div>
}
