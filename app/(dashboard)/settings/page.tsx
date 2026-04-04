'use client'

import { useState } from 'react'
import { useProfileStore } from '@/store/use-profile-store'
import { useTrainingStore } from '@/store/use-training-store'
import { useDietStore } from '@/store/use-diet-store'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { User, Database, Trash2, CheckCircle2, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SettingsPage() {
  const { profile, updateProfile } = useProfileStore()
  const { programs, workoutLogs } = useTrainingStore()
  const { savedMeals, mealEntries } = useDietStore()

  const [name, setName] = useState(profile?.name ?? '')
  const [saved, setSaved] = useState(false)

  function handleSaveName() {
    updateProfile({ name: name.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const dataStats = [
    { label: 'Training programs', value: programs.length },
    { label: 'Workout logs', value: workoutLogs.length },
    { label: 'Saved meals', value: savedMeals.length },
    { label: 'Meal entries', value: mealEntries.length },
  ]

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <PageHeader title="Settings" subtitle="Manage your preferences and data." />

      <div className="space-y-6">
        {/* Profile */}
        <div className="card-premium p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Profile</h2>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Your name (optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="max-w-xs"
                />
                <Button size="sm" onClick={handleSaveName} disabled={!name.trim()}>
                  Save
                </Button>
              </div>
            </div>
          </div>
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium mt-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Data summary */}
        <div className="card-premium p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Local data</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {dataStats.map(({ label, value }) => (
              <div key={label} className="p-3 rounded-xl bg-muted">
                <div className="text-lg font-semibold stat-number text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            All data is stored locally in your browser. No account required.
          </p>
        </div>

        {/* App info */}
        <div className="card-premium p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Apex</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            A premium training and nutrition command center. Local-first, no login required.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              v1.0
            </span>
            <span className="text-[11px] text-muted-foreground">
              Local-first · No auth · Vercel-ready
            </span>
          </div>
        </div>

        {/* Danger zone */}
        <div className="card-premium p-5 border-destructive/30">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="w-4 h-4 text-destructive" />
            <h2 className="text-sm font-semibold text-foreground">Reset data</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            This will permanently delete all your local data including programs,
            workout logs, and meal entries. This cannot be undone.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => {
              if (
                confirm(
                  'Are you sure? This will delete all your data permanently.'
                )
              ) {
                localStorage.clear()
                window.location.reload()
              }
            }}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Reset all data
          </Button>
        </div>
      </div>
    </div>
  )
}
