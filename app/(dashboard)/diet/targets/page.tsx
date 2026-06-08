'use client'

import { useState, useEffect } from 'react'
import { useProfileStore } from '@/store/use-profile-store'
import { PageHeader } from '@/components/layout/page-header'
import { SectionTabs } from '@/components/shared/section-tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  calculateBMR,
  calculateTDEE,
  getCalorieTargets,
  ACTIVITY_LABELS,
} from '@/lib/calculations/calories'
import { CalorieTarget } from '@/types/diet'
import { GoalType, ActivityLevel, Sex } from '@/types/profile'
import { cn } from '@/lib/utils'
import { Flame, Info, CheckCircle2 } from 'lucide-react'
import { formatCalories } from '@/lib/utils/format'
import { motion, AnimatePresence } from 'framer-motion'

const DIET_TABS = [
  { href: '/diet/log', label: 'Daily Log' },
  { href: '/diet/targets', label: 'Targets' },
  { href: '/diet/meals', label: 'Meal Library' },
  { href: '/diet/progress', label: 'Progress' },
]

export default function TargetsPage() {
  const { profile, updateProfile, setCalorieTarget, setCustomCalorieTarget } = useProfileStore()

  const [age, setAge] = useState(String(profile?.age ?? ''))
  const [sex, setSex] = useState<Sex>(profile?.sex ?? 'male')
  const [weight, setWeight] = useState(String(profile?.weightKg ?? ''))
  const [height, setHeight] = useState(String(profile?.heightCm ?? ''))
  const [activity, setActivity] = useState<ActivityLevel>(
    profile?.activityLevel ?? 'moderate'
  )
  const [targets, setTargets] = useState<CalorieTarget[]>([])
  const [maintenance, setMaintenance] = useState<number | null>(
    profile?.maintenanceCalories ?? null
  )
  const [selectedTarget, setSelectedTarget] = useState<GoalType | null>(
    profile?.goalType ?? null
  )
  const [saved, setSaved] = useState(false)
  const [customTargetInput, setCustomTargetInput] = useState(
    profile?.customCalorieTarget ? String(profile.customCalorieTarget) : ''
  )

  function handleCalculate() {
    const a = parseInt(age)
    const w = parseFloat(weight)
    const h = parseFloat(height)
    if (!a || !w || !h || a < 10 || w < 30 || h < 100) return

    const bmr = calculateBMR(w, h, a, sex)
    const tdee = calculateTDEE(bmr, activity)
    const calTargets = getCalorieTargets(tdee)

    setMaintenance(tdee)
    setTargets(calTargets)
    updateProfile({ age: a, sex, weightKg: w, heightCm: h, activityLevel: activity })
  }

  function handleSaveCustomTarget() {
    const val = parseInt(customTargetInput)
    if (!customTargetInput.trim() || isNaN(val) || val < 500) {
      setCustomCalorieTarget(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      return
    }
    setCustomCalorieTarget(val)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleSelectTarget(target: CalorieTarget) {
    setSelectedTarget(target.key)
    setCalorieTarget(target.key, target.calories, maintenance!)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const isFormValid =
    age && weight && height && parseFloat(weight) > 30 && parseFloat(height) > 100

  // Auto-calculate if profile already has data
  useEffect(() => {
    if (profile?.age && profile?.weightKg && profile?.heightCm && !maintenance) {
      const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.sex ?? 'male')
      const tdee = calculateTDEE(bmr, profile.activityLevel ?? 'moderate')
      setMaintenance(tdee)
      setTargets(getCalorieTargets(tdee))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <PageHeader title="Calorie Targets" subtitle="Calculate your maintenance and set a goal." />

      <SectionTabs tabs={DIET_TABS} className="mb-6" />

      {/* Calculator */}
      <div className="card-premium p-5 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-5">Your stats</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1.5">
            <Label>Age</Label>
            <Input
              type="number"
              placeholder="25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="10"
              max="100"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Sex</Label>
            <Select value={sex} onValueChange={(v) => setSex(v as Sex)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other / prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Weight (kg)</Label>
            <Input
              type="number"
              placeholder="80"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              step="0.5"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Height (cm)</Label>
            <Input
              type="number"
              placeholder="180"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5 mb-5">
          <Label>Activity level</Label>
          <Select
            value={activity}
            onValueChange={(v) => setActivity(v as ActivityLevel)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          className="w-full"
          onClick={handleCalculate}
          disabled={!isFormValid}
        >
          <Flame className="w-4 h-4 mr-2" />
          Calculate maintenance calories
        </Button>
      </div>

      {/* Custom target override — always visible */}
      <div className="card-premium p-5 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-1">Custom target</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Set your own daily calorie target. This overrides any recommended value everywhere in the app.
          {profile?.calorieTarget && !profile?.customCalorieTarget && (
            <span className="ml-1">
              Current recommendation: <span className="font-medium text-foreground">{formatCalories(profile.calorieTarget)} kcal</span>
            </span>
          )}
        </p>
        <div className="flex gap-2 items-end">
          <div className="space-y-1.5 flex-1">
            <Label htmlFor="custom-target">Your target (kcal)</Label>
            <Input
              id="custom-target"
              type="number"
              placeholder={profile?.calorieTarget ? String(profile.calorieTarget) : '2200'}
              value={customTargetInput}
              onChange={(e) => setCustomTargetInput(e.target.value)}
              min="500"
              max="10000"
              step="50"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveCustomTarget()}
            />
          </div>
          <Button onClick={handleSaveCustomTarget}>Save</Button>
        </div>
        {profile?.customCalorieTarget ? (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active: {formatCalories(profile.customCalorieTarget)} kcal/day
            </div>
            <button
              onClick={() => {
                setCustomCalorieTarget(null)
                setCustomTargetInput('')
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear override
            </button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            Leave empty to use the recommended value below.
          </p>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {maintenance && targets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Maintenance card */}
            <div className="card-premium p-5 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Maintenance calories
                  </div>
                  <div className="text-3xl font-semibold stat-number text-primary mt-0.5">
                    {formatCalories(maintenance)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Based on Mifflin-St Jeor formula. This is your estimated TDEE.
                  </div>
                </div>
              </div>
            </div>

            {/* Target options */}
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Choose your target
              </h2>
              <div className="space-y-2.5">
                {targets.map((target) => (
                  <button
                    key={target.key}
                    onClick={() => handleSelectTarget(target)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-150',
                      selectedTarget === target.key
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {target.label}
                        </span>
                        {target.deficit > 0 && (
                          <span className="text-[10px] font-medium text-muted-foreground">
                            −{target.deficit} kcal/day
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {target.description}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-semibold stat-number text-foreground">
                        {formatCalories(target.calories)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">kcal/day</div>
                    </div>
                    {selectedTarget === target.key && (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex gap-2 p-3 rounded-xl bg-muted text-xs text-muted-foreground">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                These are estimates. Individual metabolism varies. Monitor your
                results over 2–3 weeks and adjust if needed. This is not medical
                advice.
              </p>
            </div>

            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 text-sm text-emerald-600 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Target saved
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
