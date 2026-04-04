'use client'

import { WorkoutDay } from '@/types/training'
import { WorkoutLog } from '@/types/training'
import { cn } from '@/lib/utils'
import { CheckCircle2, ChevronRight, Circle } from 'lucide-react'
import { getDayName } from '@/lib/utils/date'

type WorkoutDayCardProps = {
  day: WorkoutDay
  isToday: boolean
  log?: WorkoutLog
  onClick: () => void
}

export function WorkoutDayCard({ day, isToday, log, onClick }: WorkoutDayCardProps) {
  const completed = log?.completed ?? false
  const inProgress = log && !completed
  const totalExercises = day.exercises.length
  const completedSets = log
    ? log.exerciseLogs.reduce(
        (sum, el) => sum + el.sets.filter((s) => s.completed).length,
        0
      )
    : 0
  const totalSets = day.exercises.reduce((sum, ex) => sum + ex.plannedSets, 0)

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all duration-150',
        'hover:shadow-sm active:scale-[0.99]',
        isToday && !completed
          ? 'border-primary/30 bg-primary/5 hover:bg-primary/8'
          : completed
          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20'
          : 'border-border bg-card hover:bg-muted/30'
      )}
    >
      {/* Day label */}
      <div className="w-10 shrink-0 text-center">
        <div
          className={cn(
            'text-[11px] font-medium uppercase tracking-wide',
            isToday ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {getDayName(day.dayIndex)}
        </div>
      </div>

      {/* Status icon */}
      <div className="shrink-0">
        {completed ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={2} />
        ) : inProgress ? (
          <Circle className="w-5 h-5 text-primary" strokeWidth={2} />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground/40" strokeWidth={1.5} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-semibold',
              completed ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'
            )}
          >
            {day.name}
          </span>
          {isToday && (
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
              Today
            </span>
          )}
          {completed && (
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
              Done
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {totalExercises} exercises · {totalSets} sets
          {inProgress && completedSets > 0 && (
            <span className="text-primary ml-1.5">
              · {completedSets}/{totalSets} sets done
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
    </button>
  )
}
