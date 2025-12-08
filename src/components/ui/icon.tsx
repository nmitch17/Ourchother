import { cn } from '@/lib/utils'

export interface IconProps {
  name: string
  className?: string
}

export function Icon({ name, className }: IconProps) {
  return <i className={cn(`gg-${name}`, className)} />
}
