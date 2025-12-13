import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

// Complementary colors for warm orange (#e85d04) accent
// Using earth tones and muted complementary shades
const variantStyles = {
  // Neutral warm gray
  default: 'bg-[#f5f3f0] text-[#5c5a57]',
  // Sage green - earthy complement to orange
  success: 'bg-[#e8f0e8] text-[#3d6b4f]',
  // Warm amber/orange - matches accent family
  warning: 'bg-[#fff4ed] text-[#c43d00]',
  // Dusty terracotta - warm red that complements orange
  error: 'bg-[#fceeed] text-[#b54a3c]',
  // Muted teal - cool complement to warm orange
  info: 'bg-[#e8f4f4] text-[#2d6a6a]',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
