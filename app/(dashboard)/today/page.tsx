'use client'

import { useTrainingStore } from '@/store/use-training-store'
import { useDietStore } from '@/store/use-diet-store'
import { useProfileStore } from '@/store/use-profile-store'
import { CalorieRing } from '@/components/shared/calorie-ring'
import { StatCard } from '@/components/shared/stat-card'
import { Button } from '@/components/ui/button'
import { getTodayString, getDayIndex, DAY_FULL_NAMES } from '@/lib/utils/date'
import { formatCalories, formatDuration } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import {
  Dumbbell, Flame, CheckCircle2, ArrowRight, Coffee, Sun,
  Moon, Apple, Plus, Calendar, TrendingUp, Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

const DEFAULT_TARGET = 2200

const FADE_UP = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export default function TodayPage() {
  const router = useRouter()
  const today = getTodayString()
  const todayDayIndex = getDayIndex()
  const dayName = DAY_FULL_NAMES[todayDayIndex]

  const { getActiveProgram, workoutLogs } = useTrainingStore()
  const { getDailySummary, getWeeklyAdherence, getFrequentMeals } = useDietStore()
  const { profile } = useProfileStore()

  const program = getActiveProgram()
  const target = profile?.calorieTarget ?? DEFAULT_TARGET
  const summary = getDailySummary(today, target)
  const adherence = getWeeklyAdherence(target)
  const frequentMeals = getFrequentMeals(3)

  // Today's workout
  const todayWorkout = program?.weeks[0]?.workoutDays.find(
    (d) => d.dayIndex === todayDayIndex
  )
  const todayLog = workoutLogs.find(
    (l) => l.workoutDayId === todayWorkout?.id && l.date === today
  )
  const workoutCompleted = todayLog?.completed ?? false
  const workoutInProgress = todayLog && !workoutCompleted

  // Weekly training adherence
  const programDays = program?.weeks[0]?.workoutDays.length ?? 0
  const thisWeekLogs = workoutLogs.filter((l) => {
    const monday = format(
      new Date(new Date().setDate(new Date().getDate() - todayDayIndex)),
      'yyyy-MM-dd'
    )
    return l.date >= monday && l.date <= today && l.completed
  })
  const weekTrainingPct =
    programDays > 0
      ? Math.round((thisWeekLogs.length / programDays) * 100)
      : 0

  // Macro totals
  const totalProtein = summary.meals.reduce(
    (sum, m) => sum + (m.protein ?? 0),
    0
  )

  return (
    <div className="px-4 lg:px-8 py-7 max-w-4xl mx-auto">
      {/* Greeting */}
      <motion.div
        initial="hidden"
        animate="show"
        className="mb-8"
      >
        <motion.div custom={0} variants={FADE_UP}>
          <p className="text-sm font-medium text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mt-0.5">
            {profile?.name ? `Good day, ${profile.name}.` : 'Good day.'}
          </h1>
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="show"
        className="space-y-5"
      >
        {/* Top row: Calories + Workout side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Calorie card */}
          <motion.div custom={1} variants={FADE_UP}>
            <div className="card-premium p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">Today's calories</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary"
                  onClick={() => router.push('/diet/log')}
                >
                  Log meal
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
              <div className="flex items-center gap-6">
                <CalorieRing consumed={summary.consumedCalories} target={target} size={96} strokeWidth={7} />
                <div className="flex-1 space-y-2">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Consumed</div>
                    <div className="text-xl font-semibold stat-number text-foreground">
                      {formatCalories(summary.consumedCalories)}
                      <span className="text-xs font-normal text-muted-foreground ml-1">kcal</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Target</div>
                    <div className="text-sm font-semibold stat-number text-muted-foreground">
                      {formatCalories(target)} kcal
                    </div>
                  </div>
                  {totalProtein > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Protein</div>
                      <div className="text-sm font-semibold stat-number text-muted-foreground">
                        {Math.round(totalProtein)}g
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Meal breakdown */}
              {summary.meals.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/60 space-y-1.5">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => {
                    const typeMeals = summary.meals.filter((m) => m.mealType === type)
                    if (typeMeals.length === 0) return null
                    const typeTotal = typeMeals.reduce((sum, m) => sum + m.calories, 0)
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground capitalize">{type}</span>
                        <span className="text-xs font-medium stat-number text-foreground">
                          {formatCalories(typeTotal)} kcal
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Workout card */}
          <motion.div custom={2} variants={FADE_UP}>
            <div
              className={cn(
                'card-premium p-5 flex flex-col',
                workoutCompleted && 'border-emerald-200 dark:border-emerald-900/40',
                !todayWorkout && 'border-dashed'
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">Today's workout</h2>
                {workoutCompleted && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
              </div>

              {!todayWorkout ? (
                <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Rest day</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {dayName} is a recovery day.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => router.push('/training/program')}
                  >
                    View program
                  </Button>
                </div>
              ) : workoutCompleted ? (
                <div className="flex-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                    {todayWorkout.name} done
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {todayLog?.exerciseLogs.reduce(
                      (sum, el) => sum + el.sets.filter((s) => s.completed).length,
                      0
                    )}{' '}
                    sets completed
                    {todayLog?.durationMinutes && ` · ${formatDuration(todayLog.durationMinutes)}`}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => router.push(`/training/workout/${todayWorkout.id}`)}
                  >
                    View session
                  </Button>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Dumbbell className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-base font-semibold text-foreground">{todayWorkout.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {todayWorkout.exercises.length} exercises ·{' '}
                    {todayWorkout.exercises.reduce((sum, e) => sum + e.plannedSets, 0)} sets
                  </p>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => router.push(`/training/workout/${todayWorkout.id}`)}
                  >
                    <Zap className="w-4 h-4 mr-1.5" />
                    {workoutInProgress ? 'Continue workout' : 'Start workout'}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div custom={3} variants={FADE_UP}>
          <div className="grid grid-cols-3 gap-3.5">
            <StatCard
              label="Calorie adherence"
              value={`${adherence}%`}
              sublabel="this week"
              size="sm"
              icon={Flame}
              iconColor={adherence >= 70 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}
            />
            <StatCard
              label="Training"
              value={`${thisWeekLogs.length}/${programDays}`}
              sublabel="days this week"
              size="sm"
              icon={Dumbbell}
              iconColor="bg-primary/10 text-primary"
            />
            <StatCard
              label="Week progress"
              value={`${weekTrainingPct}%`}
              sublabel="completion"
              size="sm"
              icon={TrendingUp}
              iconColor="bg-muted text-muted-foreground"
            />
          </div>
        </motion.div>

        {/* Quick-add meals */}
        {frequentMeals.length > 0 && (
          <motion.div custom={4} variants={FADE_UP}>
            <div className="card-premium p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">Quick-add meals</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={() => router.push('/diet/log')}
                >
                  See all
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {frequentMeals.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => router.push('/diet/log')}
                    className="flex flex-col gap-1 p-3.5 rounded-xl border border-border bg-muted/30 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                      {meal.name}
                    </div>
                    <div className="text-[11px] font-medium text-primary">
                      {formatCalories(meal.defaultCalories)} kcal
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* No program prompt */}
        {!program && (
          <motion.div custom={5} variants={FADE_UP}>
            <div className="card-premium p-5 border-dashed">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Dumbbell className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    Set up your training program
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Build your weekly workout split to start tracking sessions and progression.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => router.push('/training/program')}
                  >
                    Create program
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
