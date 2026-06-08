'use client'

import { useState } from 'react'
import { useDietStore } from '@/store/use-diet-store'
import { useProfileStore } from '@/store/use-profile-store'
import { PageHeader } from '@/components/layout/page-header'
import { SectionTabs } from '@/components/shared/section-tabs'
import { CalorieRing } from '@/components/shared/calorie-ring'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { MealEntry, MealType, SavedMeal } from '@/types/diet'
import { generateId, formatCalories } from '@/lib/utils/format'
import { getTodayString, formatDisplayDate } from '@/lib/utils/date'
import { cn } from '@/lib/utils'
import {
  Plus, Salad, Trash2, Coffee, Sun, Moon, Apple, ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const DIET_TABS = [
  { href: '/diet/log', label: 'Daily Log' },
  { href: '/diet/targets', label: 'Targets' },
  { href: '/diet/meals', label: 'Meal Library' },
  { href: '/diet/progress', label: 'Progress' },
]

const MEAL_TYPES: { type: MealType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'breakfast', label: 'Breakfast', icon: Coffee },
  { type: 'lunch', label: 'Lunch', icon: Sun },
  { type: 'dinner', label: 'Dinner', icon: Moon },
  { type: 'snack', label: 'Snacks', icon: Apple },
]

const DEFAULT_TARGET = 2200

export default function DietLogPage() {
  const today = getTodayString()
  const { profile } = useProfileStore()
  const {
    getDayEntries,
    savedMeals,
    addMealEntry,
    deleteMealEntry,
    getSuggestedMeals,
  } = useDietStore()

  const target = profile?.customCalorieTarget ?? profile?.calorieTarget ?? DEFAULT_TARGET
  const entries = getDayEntries(today)
  const totalConsumed = entries.reduce((sum, e) => sum + e.calories, 0)
  const remaining = Math.max(target - totalConsumed, 0)
  const isOver = totalConsumed > target

  const [showAddSheet, setShowAddSheet] = useState(false)
  const [addMealType, setAddMealType] = useState<MealType>('lunch')
  const [addMode, setAddMode] = useState<'saved' | 'custom'>('saved')
  const [selectedSavedId, setSelectedSavedId] = useState('')
  const [customName, setCustomName] = useState('')
  const [customCalories, setCustomCalories] = useState('')
  const [customProtein, setCustomProtein] = useState('')

  const suggestions = getSuggestedMeals(remaining, addMealType)
  const { addSavedMeal, incrementMealUseCount } = useDietStore()

  function openAddSheet(mealType: MealType) {
    setAddMealType(mealType)
    setShowAddSheet(true)
  }

  function handleAddSavedMeal() {
    const saved = savedMeals.find((m) => m.id === selectedSavedId)
    if (!saved) return
    const entry: MealEntry = {
      id: generateId(),
      date: today,
      mealType: addMealType,
      savedMealId: saved.id,
      name: saved.name,
      calories: saved.defaultCalories,
      protein: saved.protein,
      carbs: saved.carbs,
      fats: saved.fats,
      serving: saved.serving,
      tags: saved.tags,
      createdAt: new Date().toISOString(),
    }
    addMealEntry(entry)
    incrementMealUseCount(saved.id)
    setSelectedSavedId('')
    setShowAddSheet(false)
  }

  function handleAddCustom() {
    if (!customName.trim() || !customCalories) return
    const cal = parseInt(customCalories)
    if (isNaN(cal) || cal < 0) return

    const entry: MealEntry = {
      id: generateId(),
      date: today,
      mealType: addMealType,
      name: customName.trim(),
      calories: cal,
      protein: customProtein ? parseInt(customProtein) : undefined,
      createdAt: new Date().toISOString(),
    }
    addMealEntry(entry)

    // Optionally save to library
    const shouldSave = savedMeals.length < 50
    if (shouldSave && customName.trim().length > 3) {
      addSavedMeal({
        id: generateId(),
        name: customName.trim(),
        defaultCalories: cal,
        protein: customProtein ? parseInt(customProtein) : undefined,
        mealType: addMealType,
        useCount: 1,
        lastUsedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
    }

    setCustomName('')
    setCustomCalories('')
    setCustomProtein('')
    setShowAddSheet(false)
  }

  function handleQuickAdd(meal: SavedMeal, mealType: MealType) {
    const entry: MealEntry = {
      id: generateId(),
      date: today,
      mealType,
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
        title="Daily Log"
        subtitle={formatDisplayDate(today)}
      />

      <SectionTabs tabs={DIET_TABS} className="mb-6" />

      {/* Calorie summary */}
      <div className="card-premium p-5 mb-6">
        <div className="flex items-center gap-6">
          <CalorieRing consumed={totalConsumed} target={target} size={100} strokeWidth={7} />
          <div className="flex-1 grid grid-cols-3 gap-2">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Target
              </div>
              <div className="text-xl font-semibold stat-number text-foreground mt-0.5">
                {formatCalories(target)}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Eaten
              </div>
              <div
                className={cn(
                  'text-xl font-semibold stat-number mt-0.5',
                  isOver ? 'text-orange-500' : 'text-foreground'
                )}
              >
                {formatCalories(totalConsumed)}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {isOver ? 'Over by' : 'Remaining'}
              </div>
              <div
                className={cn(
                  'text-xl font-semibold stat-number mt-0.5',
                  isOver ? 'text-orange-500' : 'text-emerald-600 dark:text-emerald-400'
                )}
              >
                {formatCalories(isOver ? totalConsumed - target : remaining)}
              </div>
            </div>
          </div>
        </div>

        {profile?.customCalorieTarget == null && profile?.calorieTarget == null && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Set a calorie target in the{' '}
            <a href="/diet/targets" className="text-primary underline-offset-2 hover:underline">
              Targets
            </a>{' '}
            tab.
          </p>
        )}
      </div>

      {/* Suggestions row */}
      {suggestions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
            Suggestions for you
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            {suggestions.map((meal) => (
              <button
                key={meal.id}
                onClick={() => handleQuickAdd(meal, 'snack')}
                className="shrink-0 flex flex-col gap-1.5 p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left w-40"
              >
                <div className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                  {meal.name}
                </div>
                <div className="text-[11px] font-medium text-primary">
                  {formatCalories(meal.defaultCalories)} kcal
                </div>
                {meal.tags?.includes('high-protein') && (
                  <div className="text-[10px] text-muted-foreground">High protein</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Meal groups */}
      <div className="space-y-3.5">
        {MEAL_TYPES.map(({ type, label, icon: Icon }) => {
          const mealEntries = entries.filter((e) => e.mealType === type)
          const mealTotal = mealEntries.reduce((sum, e) => sum + e.calories, 0)

          return (
            <div key={type} className="card-premium overflow-hidden">
              {/* Meal type header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/60">
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <span className="text-sm font-semibold text-foreground flex-1">
                  {label}
                </span>
                {mealTotal > 0 && (
                  <span className="text-xs font-semibold tabular text-muted-foreground">
                    {formatCalories(mealTotal)} kcal
                  </span>
                )}
              </div>

              {/* Entries */}
              {mealEntries.length === 0 ? (
                <div className="px-4 py-3.5 text-xs text-muted-foreground/60 italic">
                  Nothing logged yet
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  <AnimatePresence>
                    {mealEntries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {entry.name}
                          </div>
                          {entry.serving && (
                            <div className="text-xs text-muted-foreground">{entry.serving}</div>
                          )}
                        </div>
                        <div className="text-sm font-semibold tabular text-foreground shrink-0">
                          {formatCalories(entry.calories)}
                          <span className="text-xs font-normal text-muted-foreground ml-0.5">
                            kcal
                          </span>
                        </div>
                        <button
                          onClick={() => deleteMealEntry(entry.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Add button */}
              <div className="px-3 py-2.5 border-t border-border/40">
                <button
                  onClick={() => openAddSheet(type)}
                  className="flex items-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors w-full"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to {label.toLowerCase()}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add meal sheet */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto px-5 pb-6">
          <SheetHeader className="px-0">
            <SheetTitle>Add to {MEAL_TYPES.find((m) => m.type === addMealType)?.label}</SheetTitle>
          </SheetHeader>

          {/* Mode tabs */}
          <div className="flex gap-1 p-1.5 bg-muted rounded-xl mt-2 mb-5">
            <button
              onClick={() => setAddMode('saved')}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                addMode === 'saved' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
            >
              Saved meals
            </button>
            <button
              onClick={() => setAddMode('custom')}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                addMode === 'custom' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
            >
              Custom
            </button>
          </div>

          {addMode === 'saved' ? (
            <div className="space-y-4 pb-4">
              <div className="space-y-1.5">
                <Label>Choose a saved meal</Label>
                <Select value={selectedSavedId} onValueChange={(v) => setSelectedSavedId(v ?? '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {savedMeals
                      .sort((a, b) => b.useCount - a.useCount)
                      .map((meal) => (
                        <SelectItem key={meal.id} value={meal.id}>
                          <span>{meal.name}</span>
                          <span className="text-muted-foreground ml-2 text-xs">
                            {formatCalories(meal.defaultCalories)} kcal
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Quick suggestions
                  </div>
                  <div className="space-y-1.5">
                    {suggestions.slice(0, 4).map((meal) => (
                      <button
                        key={meal.id}
                        onClick={() => {
                          setSelectedSavedId(meal.id)
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-3.5 py-3 rounded-lg border text-left transition-all',
                          selectedSavedId === meal.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        )}
                      >
                        <div>
                          <div className="text-sm font-medium text-foreground">{meal.name}</div>
                          {meal.serving && (
                            <div className="text-xs text-muted-foreground">{meal.serving}</div>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-foreground tabular">
                          {formatCalories(meal.defaultCalories)}
                          <span className="text-xs font-normal text-muted-foreground ml-0.5">
                            kcal
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleAddSavedMeal}
                disabled={!selectedSavedId}
              >
                Add meal
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              <div className="space-y-1.5">
                <Label>Meal name</Label>
                <Input
                  placeholder="e.g. Chicken breast + rice"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Calories</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 550"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Protein (g, optional)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 40"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleAddCustom}
                disabled={!customName.trim() || !customCalories}
              >
                Add meal
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
