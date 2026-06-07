'use client'

import { useRef } from 'react'
import { LoggedSet } from '@/types/training'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

type SetRowProps = {
  set: LoggedSet
  setIndex: number
  lastSessionSet?: LoggedSet
  repRangeMin: number
  repRangeMax: number
  onToggle: () => void
  onUpdate: (set: LoggedSet) => void
}

export function SetRow({
  set,
  setIndex,
  lastSessionSet,
  repRangeMin,
  repRangeMax,
  onToggle,
  onUpdate,
}: SetRowProps) {
  const repsRef = useRef<HTMLInputElement>(null)

  function handleWeightChange(raw: string) {
    const val = parseFloat(raw)
    if (!isNaN(val) && val >= 0) {
      onUpdate({ ...set, weight: val })
    } else if (raw === '' || raw === '-') {
      onUpdate({ ...set, weight: 0 })
    }
  }

  function handleRepsChange(raw: string) {
    const val = parseInt(raw, 10)
    if (!isNaN(val) && val >= 0) {
      onUpdate({ ...set, reps: val })
    } else if (raw === '') {
      onUpdate({ ...set, reps: 0 })
    }
  }

  const repsInRange =
    set.reps >= repRangeMin && set.reps <= repRangeMax
  const repsAboveRange = set.reps > repRangeMax
  const repsBelowRange = set.reps < repRangeMin && set.reps > 0

  return (
    <motion.div
      className={cn(
        'flex items-center gap-2 px-1 py-1.5 rounded-lg transition-colors duration-150',
        set.completed && 'bg-emerald-50/60 dark:bg-emerald-950/20'
      )}
      animate={set.completed ? { scale: [1, 0.99, 1] } : {}}
      transition={{ duration: 0.15 }}
    >
      {/* Set number */}
      <div className="w-8 text-center">
        <span
          className={cn(
            'text-xs font-semibold tabular',
            set.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
          )}
        >
          {set.setNumber}
        </span>
      </div>

      {/* Weight input */}
      <div className="flex-1">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.5"
          value={set.weight || ''}
          placeholder={lastSessionSet ? String(lastSessionSet.weight) : '0'}
          onChange={(e) => handleWeightChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
              e.preventDefault()
              repsRef.current?.focus()
              repsRef.current?.select()
            }
          }}
          className={cn(
            'w-full h-10 px-2.5 rounded-lg text-sm font-medium text-center tabular',
            'border bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
            'transition-all duration-100',
            set.completed
              ? 'border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300'
              : 'border-border'
          )}
        />
      </div>

      {/* Reps input */}
      <div className="flex-1">
        <input
          ref={repsRef}
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          value={set.reps || ''}
          placeholder={lastSessionSet ? String(lastSessionSet.reps) : `${repRangeMin}`}
          onChange={(e) => handleRepsChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onToggle()
            }
          }}
          className={cn(
            'w-full h-10 px-2.5 rounded-lg text-sm font-medium text-center tabular',
            'border bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
            'transition-all duration-100',
            set.completed
              ? 'border-emerald-200 dark:border-emerald-900/40'
              : repsBelowRange
              ? 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300'
              : repsAboveRange
              ? 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300'
              : 'border-border'
          )}
        />
      </div>

      {/* Complete toggle */}
      <div className="w-8 flex justify-center">
        <button
          onClick={onToggle}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150',
            set.completed
              ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
              : 'border-2 border-muted-foreground/30 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
          )}
        >
          {set.completed && (
            <motion.svg
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 8l3.5 3.5L13 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          )}
        </button>
      </div>
    </motion.div>
  )
}
