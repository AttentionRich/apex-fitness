'use client'

import { useState } from 'react'
import { useTrainingStore } from '@/store/use-training-store'
import { PageHeader } from '@/components/layout/page-header'
import { SectionTabs } from '@/components/shared/section-tabs'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { TrainingProgram, WorkoutDay, PlannedExercise } from '@/types/training'
import { generateId } from '@/lib/utils/format'
import { getDayName, DAY_FULL_NAMES } from '@/lib/utils/date'
import { cn } from '@/lib/utils'
import {
  Plus, Dumbbell, Pencil, Trash2, ChevronRight, GripVertical, Settings2
} from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

const TRAINING_TABS = [
  { href: '/training', label: 'This Week' },
  { href: '/training/program', label: 'Program' },
  { href: '/training/exercises', label: 'Exercises' },
  { href: '/training/progress', label: 'Progress' },
]

export default function ProgramPage() {
  const router = useRouter()
  const {
    programs,
    activeProgramId,
    setActiveProgramId,
    addProgram,
    updateProgram,
    deleteProgram,
    getActiveProgram,
    exerciseLibrary,
    addWorkoutDay,
    updateWorkoutDay,
    deleteWorkoutDay,
    addExerciseToPlan,
    removeExerciseFromPlan,
  } = useTrainingStore()

  const program = getActiveProgram()
  const [showNewProgram, setShowNewProgram] = useState(false)
  const [newProgramName, setNewProgramName] = useState('')
  const [showAddDay, setShowAddDay] = useState(false)
  const [editingDay, setEditingDay] = useState<WorkoutDay | null>(null)
  const [newDayName, setNewDayName] = useState('')
  const [newDayIndex, setNewDayIndex] = useState('0')
  const [showAddExercise, setShowAddExercise] = useState<string | null>(null) // dayId
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [exerciseSets, setExerciseSets] = useState('3')
  const [exerciseRepMin, setExerciseRepMin] = useState('8')
  const [exerciseRepMax, setExerciseRepMax] = useState('12')

  function handleCreateProgram() {
    if (!newProgramName.trim()) return
    const id = generateId()
    const weekId = generateId()
    const prog: TrainingProgram = {
      id,
      name: newProgramName.trim(),
      startDate: format(new Date(), 'yyyy-MM-dd'),
      weeks: [{ id: weekId, weekNumber: 1, workoutDays: [] }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addProgram(prog)
    setActiveProgramId(id)
    setNewProgramName('')
    setShowNewProgram(false)
  }

  function handleAddDay() {
    if (!program || !newDayName.trim()) return
    const weekId = program.weeks[0].id
    const day: WorkoutDay = {
      id: generateId(),
      name: newDayName.trim(),
      dayIndex: parseInt(newDayIndex),
      exercises: [],
    }
    addWorkoutDay(program.id, weekId, day)
    setNewDayName('')
    setShowAddDay(false)
  }

  function handleDeleteDay(dayId: string) {
    if (!program) return
    deleteWorkoutDay(program.id, program.weeks[0].id, dayId)
  }

  function handleAddExercise(dayId: string) {
    if (!program || !selectedExerciseId) return
    const pe: PlannedExercise = {
      id: generateId(),
      exerciseId: selectedExerciseId,
      order: 999,
      plannedSets: parseInt(exerciseSets) || 3,
      repRangeMin: parseInt(exerciseRepMin) || 8,
      repRangeMax: parseInt(exerciseRepMax) || 12,
      progressionType: 'double_progression',
    }
    addExerciseToPlan(program.id, program.weeks[0].id, dayId, pe)
    setSelectedExerciseId('')
    setExerciseSets('3')
    setExerciseRepMin('8')
    setExerciseRepMax('12')
    setShowAddExercise(null)
  }

  function handleRemoveExercise(dayId: string, exerciseId: string) {
    if (!program) return
    removeExerciseFromPlan(program.id, program.weeks[0].id, dayId, exerciseId)
  }

  const week = program?.weeks[0]
  const days = week
    ? [...week.workoutDays].sort((a, b) => a.dayIndex - b.dayIndex)
    : []

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
      <PageHeader
        title="Program"
        subtitle="Build and manage your weekly training structure."
        action={
          <Button size="sm" onClick={() => setShowNewProgram(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New program
          </Button>
        }
      />

      <SectionTabs tabs={TRAINING_TABS} className="mb-6" />

      {/* Program selector */}
      {programs.length > 1 && (
        <div className="mb-4">
          <Select
            value={activeProgramId ?? ''}
            onValueChange={(v) => setActiveProgramId(v)}
          >
            <SelectTrigger className="w-56 h-9 text-sm">
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {!program ? (
        <div className="card-premium">
          <EmptyState
            icon={Dumbbell}
            title="No program yet"
            description="Create a training program to get started."
            action={{ label: 'Create program', onClick: () => setShowNewProgram(true) }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Program header */}
          <div className="card-premium p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">{program.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {days.length} training days per week
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm('Delete this program?')) deleteProgram(program.id)
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Workout days */}
          {days.map((day) => (
            <div key={day.id} className="card-premium overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                <div className="w-10 text-center">
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wide">
                    {getDayName(day.dayIndex)}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-foreground">{day.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {day.exercises.length} exercises
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => router.push(`/training/workout/${day.id}`)}
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteDay(day.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Exercises */}
              <div className="divide-y divide-border/50">
                {day.exercises.length === 0 && (
                  <div className="py-4 px-4 text-xs text-muted-foreground italic">
                    No exercises added yet
                  </div>
                )}
                {day.exercises.map((pe) => {
                  const ex = exerciseLibrary.find((e) => e.id === pe.exerciseId)
                  if (!ex) return null
                  return (
                    <div key={pe.id} className="flex items-center gap-3 px-4 py-3">
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground">{ex.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {pe.plannedSets}×{pe.repRangeMin}–{pe.repRangeMax}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveExercise(day.id, pe.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )
                })}
              </div>

              <div className="px-4 py-3 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAddExercise(day.id)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add exercise
                </Button>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setShowAddDay(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add workout day
          </Button>
        </div>
      )}

      {/* New program sheet */}
      <Sheet open={showNewProgram} onOpenChange={setShowNewProgram}>
        <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-6">
          <SheetHeader className="px-0">
            <SheetTitle>New training program</SheetTitle>
          </SheetHeader>
          <div className="py-4 px-1 space-y-4">
            <div className="space-y-1.5">
              <Label>Program name</Label>
              <Input
                placeholder="e.g. Push Pull Legs"
                value={newProgramName}
                onChange={(e) => setNewProgramName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProgram()}
                autoFocus
              />
            </div>
            <Button className="w-full" onClick={handleCreateProgram}>
              Create program
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add day sheet */}
      <Sheet open={showAddDay} onOpenChange={setShowAddDay}>
        <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-6">
          <SheetHeader className="px-0">
            <SheetTitle>Add workout day</SheetTitle>
          </SheetHeader>
          <div className="py-4 px-1 space-y-4">
            <div className="space-y-1.5">
              <Label>Day name</Label>
              <Input
                placeholder="e.g. Push A, Leg Day, Upper Body"
                value={newDayName}
                onChange={(e) => setNewDayName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Day of week</Label>
              <Select value={newDayIndex} onValueChange={(v) => setNewDayIndex(v ?? '0')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_FULL_NAMES.map((name, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleAddDay}>
              Add day
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add exercise sheet */}
      <Sheet
        open={showAddExercise !== null}
        onOpenChange={(open) => !open && setShowAddExercise(null)}
      >
        <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-6">
          <SheetHeader className="px-0">
            <SheetTitle>Add exercise</SheetTitle>
          </SheetHeader>
          <div className="py-4 px-1 space-y-4">
            <div className="space-y-1.5">
              <Label>Exercise</Label>
              <Select value={selectedExerciseId} onValueChange={(v) => setSelectedExerciseId(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {exerciseLibrary.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.name}
                      <span className="text-muted-foreground ml-1.5 text-xs capitalize">
                        · {ex.muscleGroup}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Sets</Label>
                <Input
                  type="number"
                  value={exerciseSets}
                  onChange={(e) => setExerciseSets(e.target.value)}
                  min="1"
                  max="10"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Min reps</Label>
                <Input
                  type="number"
                  value={exerciseRepMin}
                  onChange={(e) => setExerciseRepMin(e.target.value)}
                  min="1"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Max reps</Label>
                <Input
                  type="number"
                  value={exerciseRepMax}
                  onChange={(e) => setExerciseRepMax(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => showAddExercise && handleAddExercise(showAddExercise)}
              disabled={!selectedExerciseId}
            >
              Add exercise
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
