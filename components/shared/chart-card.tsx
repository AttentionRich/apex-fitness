import { cn } from '@/lib/utils'

type ChartCardProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
  height?: number
}

export function ChartCard({
  title,
  subtitle,
  children,
  action,
  className,
  height = 220,
}: ChartCardProps) {
  return (
    <div className={cn('card-premium p-5', className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  )
}
