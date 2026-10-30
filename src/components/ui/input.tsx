import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn('min-h-11 w-full rounded-xl border bg-panel-raised px-4 text-sm text-ink placeholder:text-muted focus:border-accent disabled:opacity-60', className)} {...props} />
))
Input.displayName = 'Input'
