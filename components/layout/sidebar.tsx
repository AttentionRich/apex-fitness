'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Dumbbell,
  Salad,
  BarChart3,
  Settings,
  Zap,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/today', label: 'Today', icon: LayoutDashboard },
  { href: '/training', label: 'Training', icon: Dumbbell },
  { href: '/diet', label: 'Diet', icon: Salad },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
]

const BOTTOM_ITEMS = [
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/today') return pathname === '/today'
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-full border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
          <Zap className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Apex
        </span>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive(href)
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Icon
              className={cn(
                'w-[18px] h-[18px] shrink-0',
                isActive(href) ? 'text-primary' : 'text-muted-foreground'
              )}
              strokeWidth={isActive(href) ? 2.5 : 2}
            />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-4 border-t border-border space-y-0.5 shrink-0">
        {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive(href)
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Icon
              className={cn(
                'w-[18px] h-[18px] shrink-0',
                isActive(href) ? 'text-primary' : 'text-muted-foreground'
              )}
              strokeWidth={isActive(href) ? 2.5 : 2}
            />
            {label}
          </Link>
        ))}
      </div>
    </aside>
  )
}
