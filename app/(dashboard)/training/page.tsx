'use client'

import { useTrainingStore } from '@/store/use-training-store'
import { PageHeader } from '@/components/layout/page-header'
import { SectionTabs } from '@/components/shared/section-tabs'
import { EmptyState } from '@/components/shared/empty-state'
import { WorkoutDayCard } from '@/components/training/workout-day-card'
import { getDayIndex, getDayName } from '@/lib/utils/date'
import { getTodayString } from '@/lib/utils/date'
import { Dumbbell, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

const TRAINING_TABS = [
  { href: '/training', label: 'This Week' },
  { href: '/training/program', label: 'Program' },
  { href: '/training/exercises', label: 'Exercises' },
  { href: '/training/progress', label: 'Progress' },
]

export default function TrainingPage() {
  const router = useRouter()
  const { getActiveProgram, workoutLogs } = useTrainingStore()
  const program = getActiveProgram()
  const today = getTodayString()
  const todayDayIndex = getDayIndex()

  if (!program) {
    return (
      <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
        <PageHeader title="Training" subtitle="Structure your week, track your progress." />
        <SectionTabs tabs={TRAINING_TABS} className="mb-6" />
        <EmptyState
          icon={Dumbbell}
          title="No program yet"
          description="Create a training program to start logging workouts and tracking progress."
          action={{ label: 'Create program', onClick: () => router.push('/training/program') }}
        />
      </div>
    )
  }

  const week = program.weeks[0]
  const days = [...week.workoutDays].sort((a, b) => a.dayIndex - b.dayIndex)

  // Build rest days (days not in program)
  const workoutDayIndices = new Set(days.map((d) => d.dayIndex))
  const weekDays = Array.from({ length: 7 }, (_, i) => i)

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
      <PageHeader
        title="Training"
        subtitle={program.name}
        action={
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              const todayWorkout = days.find((d) => d.dayIndex === todayDayIndex)
              if (todayWorkout) router.push(`/training/workout/${todayWorkout.id}`)
              else router.push('/training/program')
            }}
          >
            <Dumbbell className="w-4 h-4 mr-1.5" />
            {days.find((d) => d.dayIndex === todayDayIndex) ? "Today's workout" : 'View program'}
          </Button>
        }
      />

      <SectionTabs tabs={TRAINING_TABS} className="mb-6" />

      {/* Week grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-foreground">
            Week of {format(new Date(), "'week of' MMM d")}
          </h2>
          <span className="text-xs text-muted-foreground">
            {days.length} training {days.length === 1 ? 'day' : 'days'}
          </span>
        </div>

        {weekDays.map((dayIndex) => {
          const workoutDay = days.find((d) => d.dayIndex === dayIndex)
          const isToday = dayIndex === todayDayIndex
          const log = workoutLogs.find(
            (l) => l.workoutDayId === workoutDay?.id && l.date === today
          )

          if (!workoutDay) {
            return (
              <div
                key={dayIndex}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-border/50"
              >
                <div className="w-10 text-center">
                  <div
                    className={`text-[11px] font-medium uppercase tracking-wide ${
                      isToday ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {getDayName(dayIndex)}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground/60">Rest day</span>
                {isToday && (
                  <span className="ml-auto text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </div>
            )
          }

          return (
            <WorkoutDayCard
              key={workoutDay.id}
              day={workoutDay}
              isToday={isToday}
              log={log}
              onClick={() => router.push(`/training/workout/${workoutDay.id}`)}
            />
          )
        })}
      </div>
    </div>
  )
}
