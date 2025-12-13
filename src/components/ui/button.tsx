import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            // Variants
            'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover-lift': variant === 'primary',
            'bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent-light)]': variant === 'secondary',
            'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-light)]': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
            // Sizes
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-5 py-2.5 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
