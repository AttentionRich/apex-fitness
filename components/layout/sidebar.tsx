'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Dumbbell,
  Salad,
  BarChart3,
  Settings,
  Zap,
  LogOut,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOutAction } from '@/app/auth/actions'
import { ThemeSwitcherCompact } from '@/components/layout/theme-switcher'

type SidebarUser = {
  id: string
  email: string | null
  displayName: string | null
} | null

const NAV_ITEMS = [
  { href: '/today', label: 'Today', icon: LayoutDashboard },
  { href: '/training', label: 'Training', icon: Dumbbell },
  { href: '/diet', label: 'Diet', icon: Salad },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
]

const BOTTOM_ITEMS = [
  { href: '/settings', label: 'Settings', icon: Settings },
]

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return 'U'
}

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(href: string) {
    if (href === '/today') return pathname === '/today'
    return pathname.startsWith(href)
  }

  const initials = getInitials(user?.displayName ?? null, user?.email ?? null)
  const label = user?.displayName || user?.email || 'Account'

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
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150',
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
      <div className="px-3 py-4 border-t border-border space-y-1 shrink-0">
        {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150',
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

        <ThemeSwitcherCompact />

        {/* User account menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                'text-muted-foreground hover:text-foreground hover:bg-muted cursor-default'
              )}
            >
              {/* Avatar initials */}
              <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[9px] font-bold shrink-0 uppercase leading-none">
                {initials}
              </span>
              <span className="truncate text-left">{label}</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="top" align="start" className="w-52">
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-foreground truncate">{label}</p>
                {user.email && label !== user.email && (
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={async () => {
                  await signOutAction()
                }}
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </aside>
  )
}
