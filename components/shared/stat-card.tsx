import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

type StatCardProps = {
  label: string
  value: string | number
  unit?: string
  sublabel?: string
  icon?: LucideIcon
  iconColor?: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  accent?: boolean
}

export function StatCard({
  label,
  value,
  unit,
  sublabel,
  icon: Icon,
  iconColor,
  trend,
  trendLabel,
  className,
  size = 'md',
  accent = false,
}: StatCardProps) {
  const trendColors = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-red-500 dark:text-red-400',
    neutral: 'text-muted-foreground',
  }

  return (
    <div
      className={cn(
        'card-premium p-4 flex flex-col gap-3',
        accent && 'border-primary/20 bg-primary/5',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        {Icon && (
          <div
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center',
              iconColor ?? 'bg-muted text-muted-foreground'
            )}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
          </div>
        )}
      </div>

      <div className="flex items-end gap-1.5">
        <span
          className={cn(
            'stat-number leading-none',
            size === 'sm' && 'text-2xl',
            size === 'md' && 'text-3xl',
            size === 'lg' && 'text-4xl',
            accent ? 'text-primary' : 'text-foreground'
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-muted-foreground mb-0.5">
            {unit}
          </span>
        )}
      </div>

      {(sublabel || trendLabel) && (
        <div className="flex items-center gap-1.5">
          {trendLabel && trend && (
            <span className={cn('text-xs font-medium', trendColors[trend])}>
              {trendLabel}
            </span>
          )}
          {sublabel && (
            <span className="text-xs text-muted-foreground">{sublabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
