'use client'

import { useDietStore } from '@/store/use-diet-store'
import { useTrainingStore } from '@/store/use-training-store'
import { useProfileStore } from '@/store/use-profile-store'
import { PageHeader } from '@/components/layout/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { ChartCard } from '@/components/shared/chart-card'
import { EmptyState } from '@/components/shared/empty-state'
import { formatCalories } from '@/lib/utils/format'
import { formatShortDate } from '@/lib/utils/date'
import { BarChart3, Dumbbell, Flame, TrendingUp, Award } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'
import { format, subDays, startOfWeek } from 'date-fns'

const DEFAULT_TARGET = 2200

const CHART_STYLE = {
  tick: { fill: 'var(--color-muted-foreground)', fontSize: 11 },
  grid: 'var(--color-border)',
}

export default function InsightsPage() {
  const { workoutLogs, exerciseLibrary, getActiveProgram } = useTrainingStore()
  const { getCalorieTrend, getDayEntries, getFrequentMeals } = useDietStore()
  const { profile } = useProfileStore()

  const target = profile?.customCalorieTarget ?? profile?.calorieTarget ?? DEFAULT_TARGET
  const program = getActiveProgram()
  const trend = getCalorieTrend(target, 14)
  const frequentMeals = getFrequentMeals(5)

  const hasAnyData = workoutLogs.length > 0 || trend.some((d) => d.consumed > 0)

  if (!hasAnyData) {
    return (
      <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
        <PageHeader title="Insights" subtitle="Cross-section patterns and analytics." />
        <EmptyState
          icon={BarChart3}
          title="Start logging to unlock insights"
          description="Complete workouts and log meals to see patterns and intelligence here."
        />
      </div>
    )
  }

  // Calories on training vs rest days
  const trainingDayIds = new Set(
    workoutLogs.filter((l) => l.completed).map((l) => l.date)
  )
  let trainingDayCalTotal = 0
  let trainingDayCount = 0
  let restDayCalTotal = 0
  let restDayCount = 0

  trend.forEach((d) => {
    if (d.consumed === 0) return
    if (trainingDayIds.has(d.date)) {
      trainingDayCalTotal += d.consumed
      trainingDayCount++
    } else {
      restDayCalTotal += d.consumed
      restDayCount++
    }
  })

  const avgTrainingCal =
    trainingDayCount > 0 ? Math.round(trainingDayCalTotal / trainingDayCount) : 0
  const avgRestCal =
    restDayCount > 0 ? Math.round(restDayCalTotal / restDayCount) : 0

  // Muscle group frequency (from workout logs)
  const muscleFreq: Record<string, number> = {}
  workoutLogs
    .filter((l) => l.completed)
    .forEach((log) => {
      log.exerciseLogs.forEach((el) => {
        const ex = exerciseLibrary.find((e) => e.id === el.exerciseId)
        if (ex) {
          muscleFreq[ex.muscleGroup] = (muscleFreq[ex.muscleGroup] ?? 0) + 1
        }
      })
    })

  const muscleData = Object.entries(muscleFreq)
    .map(([muscle, count]) => ({ muscle: muscle.charAt(0).toUpperCase() + muscle.slice(1), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Total workouts + diet adherence
  const totalCompleted = workoutLogs.filter((l) => l.completed).length
  const adherentDays = trend.filter((d) => d.adherent).length
  const daysWithData = trend.filter((d) => d.consumed > 0).length

  // Best performing week
  const weeklyVolumes = Array.from({ length: 4 }, (_, i) => {
    const start = startOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 })
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    const sStr = format(start, 'yyyy-MM-dd')
    const eStr = format(end, 'yyyy-MM-dd')
    const logs = workoutLogs.filter((l) => l.date >= sStr && l.date <= eStr && l.completed)
    return {
      week: format(start, 'MMM d'),
      sessions: logs.length,
    }
  }).reverse()

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
      <PageHeader title="Insights" subtitle="Patterns from your training and nutrition." />

      <div className="space-y-5">
        {/* Key numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard
            label="Workouts logged"
            value={totalCompleted}
            icon={Dumbbell}
            iconColor="bg-primary/10 text-primary"
          />
          <StatCard
            label="Days on target"
            value={adherentDays}
            unit={`/ ${daysWithData}`}
            sublabel="last 14 days"
            icon={Flame}
            iconColor="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          />
          <StatCard
            label="Avg training day"
            value={avgTrainingCal > 0 ? formatCalories(avgTrainingCal) : '—'}
            unit={avgTrainingCal > 0 ? 'kcal' : ''}
            icon={TrendingUp}
            iconColor="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
          />
          <StatCard
            label="Avg rest day"
            value={avgRestCal > 0 ? formatCalories(avgRestCal) : '—'}
            unit={avgRestCal > 0 ? 'kcal' : ''}
            icon={BarChart3}
            iconColor="bg-muted text-muted-foreground"
          />
        </div>

        {/* Training vs rest day comparison */}
        {avgTrainingCal > 0 && avgRestCal > 0 && (
          <div className="card-premium p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Calories: training vs rest days
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {avgTrainingCal > avgRestCal
                ? `You eat ${formatCalories(avgTrainingCal - avgRestCal)} more on training days.`
                : avgRestCal > avgTrainingCal
                ? `You eat ${formatCalories(avgRestCal - avgTrainingCal)} more on rest days.`
                : 'Your intake is consistent across training and rest days.'}
            </p>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <div className="text-xs font-medium text-muted-foreground mb-1.5">Training days</div>
                <div className="text-xl font-semibold stat-number text-primary">
                  {formatCalories(avgTrainingCal)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">kcal avg</div>
              </div>
              <div className="p-4 rounded-xl bg-muted text-center">
                <div className="text-xs font-medium text-muted-foreground mb-1.5">Rest days</div>
                <div className="text-xl font-semibold stat-number text-foreground">
                  {formatCalories(avgRestCal)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">kcal avg</div>
              </div>
            </div>
          </div>
        )}

        {/* Muscle frequency */}
        {muscleData.length > 0 && (
          <ChartCard
            title="Muscle group frequency"
            subtitle="Sets logged by muscle group (all time)"
            height={200}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={muscleData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} horizontal={false} />
                <XAxis type="number" tick={CHART_STYLE.tick} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="muscle"
                  tick={CHART_STYLE.tick}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  formatter={(val) => [val, 'Sets']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {muscleData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={index === 0 ? 'var(--color-primary)' : 'var(--color-chart-2)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Most logged meals */}
        {frequentMeals.length > 0 && (
          <div className="card-premium p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Most logged meals</h3>
            </div>
            <div className="space-y-3">
              {frequentMeals.map((meal, i) => (
                <div key={meal.id} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-semibold text-muted-foreground text-right shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{meal.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCalories(meal.defaultCalories)} kcal · logged {meal.useCount}×
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
