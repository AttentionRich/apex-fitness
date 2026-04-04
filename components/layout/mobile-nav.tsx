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
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/today', label: 'Today', icon: LayoutDashboard },
  { href: '/training', label: 'Train', icon: Dumbbell },
  { href: '/diet', label: 'Diet', icon: Salad },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/today') return pathname === '/today'
    return pathname.startsWith(href)
  }

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around bg-card border-t border-border px-2 pb-safe">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 py-3 px-3 min-w-0 flex-1 rounded-xl transition-colors',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon
              className="w-5 h-5 shrink-0"
              strokeWidth={active ? 2.5 : 2}
            />
            <span
              className={cn(
                'text-[10px] font-medium leading-none truncate',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
