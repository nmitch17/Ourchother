'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Cormorant_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'home' },
  { href: '/projects', label: 'Projects', icon: 'folder' },
  { href: '/clients', label: 'Clients', icon: 'user' },
  { href: '/onboarding', label: 'Onboarding', icon: 'clipboard' },
  { href: '/finances', label: 'Finances', icon: 'credit-card' },
  { href: '/docs', label: 'Docs', icon: 'file-document' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-[var(--surface)] border-r border-[var(--border)] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border)]">
        <Link href="/" className="block">
          <h1 className={`${serif.className} text-2xl font-semibold text-[var(--foreground)] tracking-tight`}>
            ourchother
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[var(--accent-light)] text-[var(--accent-text)]'
                      : 'text-[var(--muted)] hover:bg-[var(--accent-light)] hover:text-[var(--foreground)]'
                  )}
                >
                  <Icon name={item.icon} className={isActive ? 'text-[var(--accent)]' : ''} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-[var(--border)] space-y-2">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm text-[var(--muted)]">Theme</span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--muted)] hover:bg-[var(--accent-light)] hover:text-[var(--foreground)] w-full transition-all duration-200"
        >
          <Icon name="log-out" />
          Logout
        </button>
      </div>
    </aside>
  )
}
