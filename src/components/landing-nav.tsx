'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function LandingNav() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto animate-fade-in-up">
      <Link href="/" className="text-xl font-semibold tracking-tight">
        ourchother
      </Link>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Link
          href="/login"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          Client login
        </Link>
      </div>
    </nav>
  )
}
