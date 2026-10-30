import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn('min-h-11 w-full rounded-xl border bg-panel-raised px-4 text-sm text-ink focus:border-accent', className)} {...props} />
))
Select.displayName = 'Select'
