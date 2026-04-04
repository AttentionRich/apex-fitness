'use client'

import { useState } from 'react'
import { ExerciseLog, ExerciseLibraryItem, PlannedExercise, LoggedSet } from '@/types/training'
import { SetRow } from '@/components/training/set-row'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Plus, Clock } from 'lucide-react'
import { generateId, formatWeight } from '@/lib/utils/format'
import { motion, AnimatePresence } from 'framer-motion'

const MUSCLE_COLORS: Record<string, string> = {
  chest: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  back: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  shoulders: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  biceps: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  triceps: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  quads: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  hamstrings: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  glutes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  calves: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
  core: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  default: 'bg-muted text-muted-foreground',
}

type ExerciseCardProps = {
  exerciseLog: ExerciseLog
  exercise: ExerciseLibraryItem
  plannedExercise: PlannedExercise
  lastSessionSets?: LoggedSet[]
  onToggleSet: (exerciseLogId: string, set: LoggedSet) => void
  onUpdateSet: (exerciseLogId: string, set: LoggedSet) => void
}

export function ExerciseCard({
  exerciseLog,
  exercise,
  plannedExercise,
  lastSessionSets,
  onToggleSet,
  onUpdateSet,
}: ExerciseCardProps) {
  const [collapsed, setCollapsed] = useState(false)

  const completedCount = exerciseLog.sets.filter((s) => s.completed).length
  const allDone = completedCount === exerciseLog.sets.length && exerciseLog.sets.length > 0

  // Last session summary
  const lastBest = lastSessionSets?.reduce(
    (best, s) => (s.completed && s.weight > (best?.weight ?? 0) ? s : best),
    undefined as LoggedSet | undefined
  )

  const colorClass =
    MUSCLE_COLORS[exercise.muscleGroup] ?? MUSCLE_COLORS.default

  return (
    <div
      className={cn(
        'card-premium overflow-hidden transition-all duration-200',
        allDone && 'border-emerald-200 dark:border-emerald-900/40'
      )}
    >
      {/* Header */}
      <button
        className="w-full flex items-start gap-3 p-4 text-left"
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">
              {exercise.name}
            </span>
            <span
              className={cn(
                'text-[10px] font-medium px-1.5 py-0.5 rounded-md capitalize',
                colorClass
              )}
            >
              {exercise.muscleGroup}
            </span>
            {allDone && (
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-md">
                ✓ Done
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {plannedExercise.plannedSets} sets · {plannedExercise.repRangeMin}–{plannedExercise.repRangeMax} reps
            </span>
            {lastBest && (
              <span className="text-xs text-muted-foreground/70">
                Last: {formatWeight(lastBest.weight)} kg × {lastBest.reps}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-muted-foreground tabular">
            {completedCount}/{exerciseLog.sets.length}
          </span>
          {collapsed ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Sets */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div className="px-4 pb-4 space-y-2">
              {/* Column headers */}
              <div className="flex items-center gap-2 px-1 mb-1">
                <div className="w-8 text-[10px] font-medium text-muted-foreground uppercase">
                  Set
                </div>
                <div className="flex-1 text-[10px] font-medium text-muted-foreground uppercase">
                  Weight (kg)
                </div>
                <div className="flex-1 text-[10px] font-medium text-muted-foreground uppercase">
                  Reps
                </div>
                <div className="w-7 text-[10px] font-medium text-muted-foreground uppercase text-center">
                  ✓
                </div>
              </div>

              {exerciseLog.sets.map((set, idx) => (
                <SetRow
                  key={set.id}
                  set={set}
                  setIndex={idx}
                  lastSessionSet={lastSessionSets?.[idx]}
                  repRangeMin={plannedExercise.repRangeMin}
                  repRangeMax={plannedExercise.repRangeMax}
                  onToggle={() => onToggleSet(exerciseLog.id, set)}
                  onUpdate={(updated) => onUpdateSet(exerciseLog.id, updated)}
                />
              ))}

              {/* Rest time hint */}
              {plannedExercise.restSeconds && (
                <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground/70">
                  <Clock className="w-3 h-3" />
                  {plannedExercise.restSeconds >= 60
                    ? `${Math.floor(plannedExercise.restSeconds / 60)}min`
                    : `${plannedExercise.restSeconds}s`}{' '}
                  rest
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
