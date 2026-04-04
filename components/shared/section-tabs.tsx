'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type Tab = {
  href: string
  label: string
}

type SectionTabsProps = {
  tabs: Tab[]
  className?: string
}

export function SectionTabs({ tabs, className }: SectionTabsProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || (href !== tabs[0].href && pathname.startsWith(href))
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 p-1 bg-muted rounded-xl w-fit',
        className
      )}
    >
      {tabs.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
            isActive(href)
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}
