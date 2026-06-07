'use client'

import { useDietStore } from '@/store/use-diet-store'
import { useProfileStore } from '@/store/use-profile-store'
import { PageHeader } from '@/components/layout/page-header'
import { SectionTabs } from '@/components/shared/section-tabs'
import { StatCard } from '@/components/shared/stat-card'
import { ChartCard } from '@/components/shared/chart-card'
import { EmptyState } from '@/components/shared/empty-state'
import { formatCalories } from '@/lib/utils/format'
import { formatShortDate } from '@/lib/utils/date'
import { BarChart3, Flame, Target, TrendingDown } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import { format, subDays } from 'date-fns'

const DIET_TABS = [
  { href: '/diet/log', label: 'Daily Log' },
  { href: '/diet/targets', label: 'Targets' },
  { href: '/diet/meals', label: 'Meal Library' },
  { href: '/diet/progress', label: 'Progress' },
]

const DEFAULT_TARGET = 2200

const CHART_STYLE = {
  tick: { fill: 'var(--color-muted-foreground)', fontSize: 11 },
  grid: 'var(--color-border)',
}

export default function DietProgressPage() {
  const { profile } = useProfileStore()
  const { getCalorieTrend, getDayEntries, getWeeklyAdherence } = useDietStore()

  const target = profile?.calorieTarget ?? DEFAULT_TARGET
  const trend = getCalorieTrend(target, 14)
  const adherence = getWeeklyAdherence(target)

  const hasData = trend.some((d) => d.consumed > 0)

  // Stats
  const daysWithData = trend.filter((d) => d.consumed > 0)
  const avgCalories =
    daysWithData.length > 0
      ? Math.round(
          daysWithData.reduce((sum, d) => sum + d.consumed, 0) / daysWithData.length
        )
      : 0
  const adherentDays = trend.filter((d) => d.adherent).length
  const avgVsTarget = avgCalories - target
  const isUnder = avgVsTarget <= 0

  // Meal type breakdown (last 7 days)
  const mealTypeBreakdown = ['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
    let total = 0
    let count = 0
    for (let i = 0; i < 7; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const entries = getDayEntries(date).filter((e) => e.mealType === type)
      if (entries.length > 0) {
        total += entries.reduce((sum, e) => sum + e.calories, 0)
        count++
      }
    }
    return {
      type: type.charAt(0).toUpperCase() + type.slice(1),
      avg: count > 0 ? Math.round(total / count) : 0,
    }
  })

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
      <PageHeader title="Nutrition Progress" subtitle="Calorie intake and adherence trends." />

      <SectionTabs tabs={DIET_TABS} className="mb-6" />

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No data yet"
          description="Start logging meals to see your calorie trends here."
        />
      ) : (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <StatCard
              label="Avg daily intake"
              value={formatCalories(avgCalories)}
              unit="kcal"
              icon={Flame}
              iconColor="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
            />
            <StatCard
              label="Target"
              value={formatCalories(target)}
              unit="kcal"
              icon={Target}
              iconColor="bg-primary/10 text-primary"
            />
            <StatCard
              label="7-day adherence"
              value={`${adherence}%`}
              sublabel="within ±150 kcal"
              icon={TrendingDown}
              iconColor={
                adherence >= 70
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground'
              }
            />
            <StatCard
              label="Days on target"
              value={adherentDays}
              unit={`/ ${daysWithData.length}`}
              sublabel="last 14 days"
              icon={BarChart3}
              iconColor="bg-muted text-muted-foreground"
            />
          </div>

          {/* Calorie trend */}
          <ChartCard
            title="Daily calories — last 14 days"
            subtitle={`Avg: ${formatCalories(avgCalories)} kcal · Target: ${formatCalories(target)} kcal`}
            height={220}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={CHART_STYLE.tick}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(d) => formatShortDate(d)}
                  interval={2}
                />
                <YAxis tick={CHART_STYLE.tick} axisLine={false} tickLine={false} width={36} />
                <ReferenceLine
                  y={target}
                  stroke="var(--color-primary)"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  formatter={(val, name) => [
                    `${formatCalories(Number(val))} kcal`,
                    name === 'consumed' ? 'Consumed' : 'Target',
                  ]}
                  labelFormatter={(label) => formatShortDate(label)}
                />
                <Area
                  type="monotone"
                  dataKey="consumed"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#calGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--color-primary)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Meal type breakdown */}
          <ChartCard
            title="Average calories by meal"
            subtitle="7-day average per meal type"
            height={200}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mealTypeBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} vertical={false} />
                <XAxis dataKey="type" tick={CHART_STYLE.tick} axisLine={false} tickLine={false} />
                <YAxis tick={CHART_STYLE.tick} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  formatter={(val) => [`${formatCalories(Number(val))} kcal`, 'Avg']}
                />
                <Bar dataKey="avg" fill="var(--color-chart-2)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Insight callout */}
          {daysWithData.length >= 3 && (
            <div className="card-premium p-5 bg-primary/5 border-primary/20">
              <div className="text-sm font-semibold text-foreground mb-1">
                {isUnder ? 'On track' : 'Slightly over target'}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isUnder
                  ? `Your average intake is ${formatCalories(Math.abs(avgVsTarget))} kcal below target over the last ${daysWithData.length} days. You've hit your target ${adherentDays} of ${daysWithData.length} days.`
                  : `Your average intake is ${formatCalories(Math.abs(avgVsTarget))} kcal above target over the last ${daysWithData.length} days. Small consistent adjustments are more effective than large cuts.`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
