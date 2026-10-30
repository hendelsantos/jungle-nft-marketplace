import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva('inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50', {
  variants: {
    variant: {
      primary: 'bg-accent text-canvas hover:bg-[#c8ff6b]',
      secondary: 'border bg-panel-raised text-ink hover:border-accent/60',
      ghost: 'text-ink hover:bg-white/10',
      danger: 'bg-red-500/15 text-red-200 hover:bg-red-500/25',
    },
    size: { default: '', sm: 'min-h-9 px-3 text-xs', icon: 'size-11 p-0' },
  },
  defaultVariants: { variant: 'primary', size: 'default' },
})

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
))
Button.displayName = 'Button'

export { buttonVariants }
