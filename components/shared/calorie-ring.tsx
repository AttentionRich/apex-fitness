'use client'

import { cn } from '@/lib/utils'
import { formatCalories } from '@/lib/utils/format'

type CalorieRingProps = {
  consumed: number
  target: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function CalorieRing({
  consumed,
  target,
  size = 120,
  strokeWidth = 8,
  className,
}: CalorieRingProps) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const percentage = target > 0 ? Math.min(consumed / target, 1) : 0
  const offset = circumference - percentage * circumference
  const cx = size / 2
  const cy = size / 2
  const remaining = Math.max(target - consumed, 0)
  const isOver = consumed > target

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-muted"
          />
          {/* Progress */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(
              'progress-ring-track',
              isOver ? 'stroke-orange-500' : 'stroke-primary'
            )}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="stat-number text-xl text-foreground leading-none">
            {formatCalories(remaining)}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">
            {isOver ? 'over' : 'left'}
          </span>
        </div>
      </div>
    </div>
  )
}
