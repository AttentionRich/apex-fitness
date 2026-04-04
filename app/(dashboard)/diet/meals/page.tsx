'use client'

import { useState } from 'react'
import { useDietStore } from '@/store/use-diet-store'
import { useProfileStore } from '@/store/use-profile-store'
import { PageHeader } from '@/components/layout/page-header'
import { SectionTabs } from '@/components/shared/section-tabs'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { SavedMeal, MealType, MealTag } from '@/types/diet'
import { generateId, formatCalories } from '@/lib/utils/format'
import { getTodayString } from '@/lib/utils/date'
import { cn } from '@/lib/utils'
import {
  Plus, Search, Salad, Trash2, Flame, Star,
} from 'lucide-react'
import { MealEntry } from '@/types/diet'

const DIET_TABS = [
  { href: '/diet/log', label: 'Daily Log' },
  { href: '/diet/targets', label: 'Targets' },
  { href: '/diet/meals', label: 'Meal Library' },
  { href: '/diet/progress', label: 'Progress' },
]

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

const TAG_COLORS: Record<string, string> = {
  'high-protein': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'low-calorie': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'quick': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  'pre-workout': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'post-workout': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'meal-prep': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  'vegetarian': 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
}

export default function MealsLibraryPage() {
  const today = getTodayString()
  const { savedMeals, addSavedMeal, deleteSavedMeal, addMealEntry, incrementMealUseCount } = useDietStore()
  const { profile } = useProfileStore()

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fats, setFats] = useState('')
  const [serving, setServing] = useState('')
  const [mealType, setMealType] = useState<MealType>('lunch')

  const filtered = savedMeals
    .filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === 'all' || m.mealType === filterType
      return matchSearch && matchType
    })
    .sort((a, b) => b.useCount - a.useCount)

  function handleAdd() {
    if (!name.trim() || !calories) return
    const cal = parseInt(calories)
    if (isNaN(cal)) return
    addSavedMeal({
      id: generateId(),
      name: name.trim(),
      defaultCalories: cal,
      protein: protein ? parseInt(protein) : undefined,
      carbs: carbs ? parseInt(carbs) : undefined,
      fats: fats ? parseInt(fats) : undefined,
      serving: serving.trim() || undefined,
      mealType,
      useCount: 0,
      createdAt: new Date().toISOString(),
    })
    setName('')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFats('')
    setServing('')
    setShowAdd(false)
  }

  function handleUseNow(meal: SavedMeal) {
    const entry: MealEntry = {
      id: generateId(),
      date: today,
      mealType: meal.mealType ?? 'snack',
      savedMealId: meal.id,
      name: meal.name,
      calories: meal.defaultCalories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      serving: meal.serving,
      tags: meal.tags,
      createdAt: new Date().toISOString(),
    }
    addMealEntry(entry)
    incrementMealUseCount(meal.id)
  }

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <PageHeader
        title="Meal Library"
        subtitle={`${savedMeals.length} saved meals`}
        action={
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add meal
          </Button>
        }
      />

      <SectionTabs tabs={DIET_TABS} className="mb-5" />

      {/* Search + filter */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search meals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={(v) => setFilterType(v ?? 'all')}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Salad}
          title="No meals found"
          description="Save meals you eat regularly for faster logging."
          action={{ label: 'Add your first meal', onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((meal) => (
            <div
              key={meal.id}
              className="card-premium p-4 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">
                    {meal.name}
                  </span>
                  {meal.mealType && (
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded capitalize">
                      {MEAL_TYPE_LABELS[meal.mealType]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-base font-semibold stat-number text-foreground">
                    {formatCalories(meal.defaultCalories)}
                    <span className="text-xs font-normal text-muted-foreground ml-0.5">
                      kcal
                    </span>
                  </span>
                  {meal.protein && (
                    <span className="text-xs text-muted-foreground">{meal.protein}g protein</span>
                  )}
                  {meal.serving && (
                    <span className="text-xs text-muted-foreground">{meal.serving}</span>
                  )}
                </div>
                {meal.tags && meal.tags.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {meal.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          'text-[10px] font-medium px-1.5 py-0.5 rounded capitalize',
                          TAG_COLORS[tag] ?? 'bg-muted text-muted-foreground'
                        )}
                      >
                        {tag.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                  <Star className="w-3 h-3" />
                  Used {meal.useCount} {meal.useCount === 1 ? 'time' : 'times'}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2.5"
                  onClick={() => handleUseNow(meal)}
                >
                  + Log today
                </Button>
                <button
                  className="text-xs text-muted-foreground/50 hover:text-destructive transition-colors text-right"
                  onClick={() => deleteSavedMeal(meal.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add meal sheet */}
      <Sheet open={showAdd} onOpenChange={setShowAdd}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add meal to library</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-3">
            <div className="space-y-1.5">
              <Label>Meal name</Label>
              <Input
                placeholder="e.g. Chicken & Rice"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Calories *</Label>
                <Input
                  type="number"
                  placeholder="550"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  min="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Meal type</Label>
                <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Protein (g)</Label>
                <Input type="number" placeholder="40" value={protein} onChange={(e) => setProtein(e.target.value)} min="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Carbs (g)</Label>
                <Input type="number" placeholder="60" value={carbs} onChange={(e) => setCarbs(e.target.value)} min="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Fats (g)</Label>
                <Input type="number" placeholder="15" value={fats} onChange={(e) => setFats(e.target.value)} min="0" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Serving size (optional)</Label>
              <Input
                placeholder="e.g. 1 bowl (350g)"
                value={serving}
                onChange={(e) => setServing(e.target.value)}
              />
            </div>
            <Button
              className="w-full mt-2"
              onClick={handleAdd}
              disabled={!name.trim() || !calories}
            >
              Save meal
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
