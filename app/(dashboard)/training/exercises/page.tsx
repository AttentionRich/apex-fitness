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
import { ExerciseLibraryItem, MuscleGroup, ExerciseCategory } from '@/types/training'
import { generateId } from '@/lib/utils/format'
import { Search, Plus, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'

const TRAINING_TABS = [
  { href: '/training', label: 'This Week' },
  { href: '/training/program', label: 'Program' },
  { href: '/training/exercises', label: 'Exercises' },
  { href: '/training/progress', label: 'Progress' },
]

const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'quads', 'hamstrings', 'glutes', 'calves', 'core', 'other',
]

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
  other: 'bg-muted text-muted-foreground',
}

const GROUP_LABELS: Record<string, string> = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders', biceps: 'Biceps',
  triceps: 'Triceps', quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes',
  calves: 'Calves', core: 'Core', full_body: 'Full Body', other: 'Other',
}

export default function ExercisesPage() {
  const { exerciseLibrary, addExercise, deleteExercise } = useTrainingStore()
  const [search, setSearch] = useState('')
  const [filterMuscle, setFilterMuscle] = useState<string>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>('chest')
  const [newCategory, setNewCategory] = useState<ExerciseCategory>('upper')
  const [newEquipment, setNewEquipment] = useState('')

  const filtered = exerciseLibrary.filter((ex) => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase())
    const matchMuscle = filterMuscle === 'all' || ex.muscleGroup === filterMuscle
    return matchSearch && matchMuscle
  })

  // Group by muscle
  const groups = filtered.reduce((acc, ex) => {
    const key = ex.muscleGroup
    if (!acc[key]) acc[key] = []
    acc[key].push(ex)
    return acc
  }, {} as Record<string, ExerciseLibraryItem[]>)

  function handleAdd() {
    if (!newName.trim()) return
    addExercise({
      id: generateId(),
      name: newName.trim(),
      muscleGroup: newMuscle,
      category: newCategory,
      equipment: newEquipment.trim() || undefined,
      isCustom: true,
    })
    setNewName('')
    setNewEquipment('')
    setShowAdd(false)
  }

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
      <PageHeader
        title="Exercise Library"
        subtitle={`${exerciseLibrary.length} exercises`}
        action={
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add exercise
          </Button>
        }
      />

      <SectionTabs tabs={TRAINING_TABS} className="mb-5" />

      {/* Search + filter */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterMuscle} onValueChange={(v) => setFilterMuscle(v ?? 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All muscles</SelectItem>
            {MUSCLE_GROUPS.map((g) => (
              <SelectItem key={g} value={g}>{GROUP_LABELS[g] ?? g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No exercises found"
          description="Try a different search or add a custom exercise."
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(groups)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([muscle, exercises]) => (
              <div key={muscle}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={cn(
                      'text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md',
                      MUSCLE_COLORS[muscle] ?? MUSCLE_COLORS.other
                    )}
                  >
                    {GROUP_LABELS[muscle] ?? muscle}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {exercises.length}
                  </span>
                </div>
                <div className="card-premium divide-y divide-border/50 overflow-hidden">
                  {exercises.map((ex) => (
                    <div key={ex.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">
                          {ex.name}
                          {ex.isCustom && (
                            <span className="ml-2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              Custom
                            </span>
                          )}
                        </div>
                        {ex.equipment && (
                          <div className="text-xs text-muted-foreground">{ex.equipment}</div>
                        )}
                      </div>
                      {ex.isCustom && (
                        <button
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => deleteExercise(ex.id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add exercise sheet */}
      <Sheet open={showAdd} onOpenChange={setShowAdd}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Add custom exercise</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1.5">
              <Label>Exercise name</Label>
              <Input
                placeholder="e.g. Cable Lateral Raise"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Muscle group</Label>
                <Select
                  value={newMuscle}
                  onValueChange={(v) => setNewMuscle(v as MuscleGroup)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSCLE_GROUPS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {GROUP_LABELS[g] ?? g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={newCategory}
                  onValueChange={(v) => setNewCategory(v as ExerciseCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upper">Upper</SelectItem>
                    <SelectItem value="lower">Lower</SelectItem>
                    <SelectItem value="isolation">Isolation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Equipment (optional)</Label>
              <Input
                placeholder="e.g. Cable, Barbell, Dumbbell"
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={!newName.trim()}>
              Add exercise
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
