'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTrainingStore } from '@/store/use-training-store'
import { getTodayString } from '@/lib/utils/date'
import { generateId } from '@/lib/utils/format'
import { getSuggestedNextWeight } from '@/lib/calculations/progression'
import { WorkoutLog, ExerciseLog, LoggedSet, ProgressionSuggestion } from '@/types/training'
import { ExerciseCard } from '@/components/training/exercise-card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle2, Clock, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

type Props = { params: Promise<{ dayId: string }> }

export default function WorkoutPage({ params }: Props) {
  const { dayId } = use(params)
  const router = useRouter()

  const {
    getActiveProgram,
    workoutLogs,
    addWorkoutLog,
    updateWorkoutLog,
    updateLoggedSet,
    completeWorkout,
    getExerciseById,
    getExerciseHistory,
  } = useTrainingStore()

  const program = getActiveProgram()
  const today = getTodayString()
  const [startTime] = useState(Date.now())
  const [showSummary, setShowSummary] = useState(false)
  const [suggestions, setSuggestions] = useState<ProgressionSuggestion[]>([])

  // Find workout day template
  const workoutDay = program?.weeks[0]?.workoutDays.find((d) => d.id === dayId)

  // Find or create today's workout log
  const existingLog = workoutLogs.find(
    (l) => l.workoutDayId === dayId && l.date === today
  )

  // Initialize log on first open
  useEffect(() => {
    if (!workoutDay || existingLog) return
    const programId = program?.id ?? ''
    const exerciseLogs: ExerciseLog[] = workoutDay.exercises.map((pe) => ({
      id: generateId(),
      plannedExerciseId: pe.id,
      exerciseId: pe.exerciseId,
      sets: Array.from({ length: pe.plannedSets }, (_, i) => {
        // Pre-fill with last session values
        const history = getExerciseHistory(pe.exerciseId)
        const lastLog = history[history.length - 1]
        const lastSet = lastLog?.exerciseLogs
          .find((el) => el.exerciseId === pe.exerciseId)
          ?.sets[i]
        return {
          id: generateId(),
          setNumber: i + 1,
          weight: lastSet?.weight ?? 0,
          reps: lastSet?.reps ?? 0,
          completed: false,
        }
      }),
    }))
    const log: WorkoutLog = {
      id: generateId(),
      date: today,
      programId,
      workoutDayId: dayId,
      workoutDayName: workoutDay.name,
      completed: false,
      exerciseLogs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addWorkoutLog(log)
  }, [workoutDay?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const log = workoutLogs.find((l) => l.workoutDayId === dayId && l.date === today)

  if (!workoutDay || !program) {
    return (
      <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <p className="text-muted-foreground">Workout not found.</p>
      </div>
    )
  }

  if (!log) {
    return (
      <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto">
        <div className="h-8 w-40 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  // Progress calculation
  const totalSets = log.exerciseLogs.reduce((sum, el) => sum + el.sets.length, 0)
  const completedSets = log.exerciseLogs.reduce(
    (sum, el) => sum + el.sets.filter((s) => s.completed).length,
    0
  )
  const progressPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

  function handleToggleSet(exerciseLogId: string, set: LoggedSet) {
    updateLoggedSet(log!.id, exerciseLogId, {
      ...set,
      completed: !set.completed,
    })
  }

  function handleUpdateSet(exerciseLogId: string, set: LoggedSet) {
    updateLoggedSet(log!.id, exerciseLogId, set)
  }

  function handleComplete() {
    const duration = Math.round((Date.now() - startTime) / 60000)

    // Compute progression suggestions
    const newSuggestions: ProgressionSuggestion[] = []
    for (const el of log!.exerciseLogs) {
      const plannedEx = workoutDay!.exercises.find(
        (pe) => pe.id === el.plannedExerciseId
      )
      const exercise = getExerciseById(el.exerciseId)
      if (!plannedEx || !exercise) continue
      const completedS = el.sets.filter((s) => s.completed)
      if (completedS.length === 0) continue
      const currentWeight = completedS[0]?.weight ?? 0
      const suggestion = getSuggestedNextWeight({
        exerciseId: el.exerciseId,
        exerciseName: exercise.name,
        currentWeight,
        repRangeMin: plannedEx.repRangeMin,
        repRangeMax: plannedEx.repRangeMax,
        setResults: completedS,
        category: exercise.category,
      })
      newSuggestions.push(suggestion)
    }

    setSuggestions(newSuggestions)
    completeWorkout(log!.id, duration)
    setShowSummary(true)
  }

  if (showSummary) {
    return <WorkoutSummary
      workoutName={workoutDay.name}
      completedSets={completedSets}
      totalSets={totalSets}
      suggestions={suggestions}
      onDone={() => router.push('/training')}
    />
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 lg:px-8 py-4">
        <div className="flex items-center gap-3 mb-2.5">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-foreground truncate">
              {workoutDay.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), 'EEEE, MMM d')} · {completedSets}/{totalSets} sets
            </p>
          </div>
          {log.completed && (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          )}
        </div>
        <Progress value={progressPct} className="h-1.5" />
      </div>

      {/* Exercise list */}
      <div className="px-4 lg:px-8 py-6 space-y-4">
        {log.exerciseLogs.map((exerciseLog, idx) => {
          const plannedEx = workoutDay.exercises.find(
            (pe) => pe.id === exerciseLog.plannedExerciseId
          )
          const exercise = getExerciseById(exerciseLog.exerciseId)
          if (!plannedEx || !exercise) return null

          // Get last session data for reference
          const history = getExerciseHistory(exerciseLog.exerciseId)
          const lastLog = history.filter((l) => l.date < today).pop()
          const lastExerciseLog = lastLog?.exerciseLogs.find(
            (el) => el.exerciseId === exerciseLog.exerciseId
          )

          return (
            <motion.div
              key={exerciseLog.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.2 }}
            >
              <ExerciseCard
                exerciseLog={exerciseLog}
                exercise={exercise}
                plannedExercise={plannedEx}
                lastSessionSets={lastExerciseLog?.sets}
                onToggleSet={handleToggleSet}
                onUpdateSet={handleUpdateSet}
              />
            </motion.div>
          )
        })}

        {/* Bottom spacer for sticky footer */}
        <div className="h-24" />
      </div>

      {/* Sticky complete button */}
      {!log.completed && (
        <div className="fixed bottom-0 lg:bottom-0 left-0 right-0 lg:left-60 z-20 p-4 bg-background/95 backdrop-blur border-t border-border">
          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handleComplete}
            disabled={completedSets === 0}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Complete workout
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Summary Screen ───────────────────────────────────────────────────────────

function WorkoutSummary({
  workoutName,
  completedSets,
  totalSets,
  suggestions,
  onDone,
}: {
  workoutName: string
  completedSets: number
  totalSets: number
  suggestions: ProgressionSuggestion[]
  onDone: () => void
}) {
  const increaseCount = suggestions.filter((s) => s.status === 'increase').length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto px-4 lg:px-8 py-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {workoutName} complete
        </h1>
        <p className="mt-1 text-muted-foreground">
          {completedSets}/{totalSets} sets logged
          {increaseCount > 0 && ` · ${increaseCount} weight increase${increaseCount > 1 ? 's' : ''} suggested`}
        </p>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Next session suggestions
          </h2>
          <div className="space-y-2.5">
            {suggestions.map((s) => (
              <div
                key={s.exerciseId}
                className={cn(
                  'flex items-start justify-between gap-4 p-4 rounded-xl border',
                  s.status === 'increase'
                    ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                    : s.status === 'reduce'
                    ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20'
                    : 'border-border bg-card'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {s.exerciseName}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.reason}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div
                    className={cn(
                      'text-sm font-semibold tabular',
                      s.status === 'increase'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : s.status === 'reduce'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-foreground'
                    )}
                  >
                    {s.suggestedWeight > 0 ? `${s.suggestedWeight} kg` : '—'}
                  </div>
                  {s.status === 'increase' && (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      +{s.increment} kg
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 text-center">
            Suggestions are based on your recent performance. Adjust as needed.
          </p>
        </div>
      )}

      <Button className="w-full h-11" onClick={onDone}>
        Back to training
      </Button>
    </motion.div>
  )
}
