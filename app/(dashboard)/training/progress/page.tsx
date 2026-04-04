'use client'

import { useState } from 'react'
import { useTrainingStore } from '@/store/use-training-store'
import { PageHeader } from '@/components/layout/page-header'
import { SectionTabs } from '@/components/shared/section-tabs'
import { ChartCard } from '@/components/shared/chart-card'
import { StatCard } from '@/components/shared/stat-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { calculateTotalVolume, calculateEstimated1RM } from '@/lib/calculations/progression'
import { formatWeight, formatVolume } from '@/lib/utils/format'
import { formatShortDate } from '@/lib/utils/date'
import { BarChart3, Dumbbell, TrendingUp, Calendar } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { format, subDays, startOfWeek } from 'date-fns'

const TRAINING_TABS = [
  { href: '/training', label: 'This Week' },
  { href: '/training/program', label: 'Program' },
  { href: '/training/exercises', label: 'Exercises' },
  { href: '/training/progress', label: 'Progress' },
]

const CHART_STYLE = {
  tick: { fill: 'var(--color-muted-foreground)', fontSize: 11 },
  grid: 'var(--color-border)',
}

export default function TrainingProgressPage() {
  const { workoutLogs, exerciseLibrary, getActiveProgram } = useTrainingStore()
  const program = getActiveProgram()
  const [selectedExerciseId, setSelectedExerciseId] = useState('')

  const hasLogs = workoutLogs.length > 0

  // Weekly completion data (last 8 weeks)
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = startOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 })
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const wsStr = format(weekStart, 'yyyy-MM-dd')
    const weStr = format(weekEnd, 'yyyy-MM-dd')

    const weekLogs = workoutLogs.filter(
      (l) => l.date >= wsStr && l.date <= weStr && l.completed
    )
    const programDays = program?.weeks[0]?.workoutDays.length ?? 0
    const completion =
      programDays > 0 ? Math.round((weekLogs.length / programDays) * 100) : 0

    return {
      week: format(weekStart, 'MMM d'),
      completed: weekLogs.length,
      target: programDays,
      completion,
    }
  }).reverse()

  // Volume data for selected exercise
  const exerciseLogs = selectedExerciseId
    ? workoutLogs
        .filter((l) => l.exerciseLogs.some((el) => el.exerciseId === selectedExerciseId))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-12)
    : []

  const volumeData = exerciseLogs.map((log) => {
    const el = log.exerciseLogs.find((e) => e.exerciseId === selectedExerciseId)
    const volume = el ? calculateTotalVolume(el.sets) : 0
    const bestSet = el?.sets
      .filter((s) => s.completed)
      .sort((a, b) => b.weight - a.weight)[0]
    const e1rm = bestSet ? calculateEstimated1RM(bestSet.weight, bestSet.reps) : 0
    return {
      date: formatShortDate(log.date),
      volume,
      e1rm,
      weight: bestSet?.weight ?? 0,
    }
  })

  // Summary stats
  const totalCompleted = workoutLogs.filter((l) => l.completed).length
  const last7Days = workoutLogs.filter((l) => {
    const cutoff = format(subDays(new Date(), 7), 'yyyy-MM-dd')
    return l.date >= cutoff && l.completed
  }).length
  const programDays = program?.weeks[0]?.workoutDays.length ?? 0
  const thisWeekRate =
    programDays > 0
      ? Math.round(
          (workoutLogs.filter((l) => {
            const cutoff = format(
              startOfWeek(new Date(), { weekStartsOn: 1 }),
              'yyyy-MM-dd'
            )
            return l.date >= cutoff && l.completed
          }).length /
            programDays) *
            100
        )
      : 0

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
      <PageHeader title="Progress" subtitle="Your training history and trends." />

      <SectionTabs tabs={TRAINING_TABS} className="mb-6" />

      {!hasLogs ? (
        <EmptyState
          icon={BarChart3}
          title="No data yet"
          description="Complete your first workout to start seeing progress charts."
        />
      ) : (
        <div className="space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total workouts"
              value={totalCompleted}
              icon={Dumbbell}
              iconColor="bg-primary/10 text-primary"
            />
            <StatCard
              label="This week"
              value={`${last7Days}`}
              unit="sessions"
              icon={Calendar}
              iconColor="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
            />
            <StatCard
              label="Week completion"
              value={`${thisWeekRate}%`}
              icon={TrendingUp}
              iconColor={thisWeekRate >= 80 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}
            />
            <StatCard
              label="Program"
              value={program?.name ?? '—'}
              size="sm"
              icon={BarChart3}
              iconColor="bg-muted text-muted-foreground"
            />
          </div>

          {/* Weekly completion */}
          <ChartCard
            title="Weekly completion"
            subtitle="Workouts completed vs planned per week"
            height={200}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} vertical={false} />
                <XAxis dataKey="week" tick={CHART_STYLE.tick} axisLine={false} tickLine={false} />
                <YAxis tick={CHART_STYLE.tick} axisLine={false} tickLine={false} width={20} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  formatter={(val, name) => [val, name === 'completed' ? 'Done' : 'Target']}
                />
                <Bar dataKey="target" fill="var(--color-muted)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Exercise progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Exercise progress</h2>
              <Select value={selectedExerciseId} onValueChange={(v) => setSelectedExerciseId(v ?? '')}>
                <SelectTrigger className="w-48 h-8 text-xs">
                  <SelectValue placeholder="Pick an exercise" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {exerciseLibrary.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedExerciseId && volumeData.length === 0 && (
              <div className="card-premium p-8 text-center text-sm text-muted-foreground">
                No logged data for this exercise yet.
              </div>
            )}

            {volumeData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Estimated 1RM" subtitle="Trend over recent sessions" height={200}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={volumeData}>
                      <defs>
                        <linearGradient id="e1rmGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} vertical={false} />
                      <XAxis dataKey="date" tick={CHART_STYLE.tick} axisLine={false} tickLine={false} />
                      <YAxis tick={CHART_STYLE.tick} axisLine={false} tickLine={false} width={32} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--color-card)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 10,
                          fontSize: 12,
                        }}
                        formatter={(val) => [`${val} kg`, 'Est. 1RM']}
                      />
                      <Area
                        type="monotone"
                        dataKey="e1rm"
                        stroke="var(--color-primary)"
                        strokeWidth={2}
                        fill="url(#e1rmGrad)"
                        dot={{ r: 3, fill: 'var(--color-primary)' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Session volume" subtitle="Total weight × reps per session" height={200}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} vertical={false} />
                      <XAxis dataKey="date" tick={CHART_STYLE.tick} axisLine={false} tickLine={false} />
                      <YAxis tick={CHART_STYLE.tick} axisLine={false} tickLine={false} width={40} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--color-card)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 10,
                          fontSize: 12,
                        }}
                        formatter={(val) => [`${val} kg`, 'Volume']}
                      />
                      <Bar dataKey="volume" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
