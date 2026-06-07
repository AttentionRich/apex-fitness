'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTrainingStore } from '@/store/use-training-store'
import { useDietStore } from '@/store/use-diet-store'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  User,
  Database,
  Trash2,
  CheckCircle2,
  Zap,
  LogOut,
  Cloud,
  RefreshCw,
  Palette,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { signOutAction } from '@/app/auth/actions'
import { migrateLocalDataToSupabase } from '@/lib/sync/migrate-local-to-supabase'
import { ThemeSwitcherFull } from '@/components/layout/theme-switcher'

type SettingsUser = {
  id: string
  email: string | null
  displayName: string | null
} | null

export function SettingsClient({ user }: { user: SettingsUser }) {
  const { programs, workoutLogs } = useTrainingStore()
  const { savedMeals, mealEntries } = useDietStore()

  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [nameSaved, setNameSaved] = useState(false)
  const [isSaving, startSavingTransition] = useTransition()
  const [isMigrating, startMigratingTransition] = useTransition()
  const [migrationDone, setMigrationDone] = useState(false)
  const [migrationError, setMigrationError] = useState<string | null>(null)

  const router = useRouter()

  function handleSaveName() {
    if (!displayName.trim() || !user) return
    startSavingTransition(async () => {
      // Update Supabase auth metadata via browser client
      const { createSupabaseBrowserClient } = await import('@/lib/supabase/browser')
      const supabase = createSupabaseBrowserClient()
      await supabase.auth.updateUser({
        data: { display_name: displayName.trim() },
      })
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 2500)
      router.refresh()
    })
  }

  function handleManualMigration() {
    if (!user) return
    setMigrationError(null)
    startMigratingTransition(async () => {
      try {
        const result = await migrateLocalDataToSupabase(user.id)
        if (result.skipped) {
          setMigrationError(
            'Your data is already synced to Supabase — no migration needed.'
          )
        } else {
          setMigrationDone(true)
          setTimeout(() => setMigrationDone(false), 4000)
        }
      } catch {
        setMigrationError('Migration failed. Please try again.')
      }
    })
  }

  const dataStats = [
    { label: 'Training programs', value: programs.length },
    { label: 'Workout logs', value: workoutLogs.length },
    { label: 'Saved meals', value: savedMeals.length },
    { label: 'Meal entries', value: mealEntries.length },
  ]

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <PageHeader title="Settings" subtitle="Manage your account and data." />

      <div className="space-y-5">
        {/* Theme */}
        <div className="card-premium p-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Theme</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Choose your preferred visual style. Your selection is saved and applied instantly.
          </p>
          <ThemeSwitcherFull />
        </div>

        {/* Account */}
        {user && (
          <div className="card-premium p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Account</h2>
            </div>

            <div className="space-y-5">
              {/* Email (read-only) */}
              {user.email && (
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="text-sm text-foreground font-medium">{user.email}</p>
                </div>
              )}

              {/* Display name */}
              <div className="space-y-1.5">
                <Label>Display name</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Alex"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="max-w-xs"
                    disabled={isSaving}
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveName}
                    disabled={!displayName.trim() || isSaving}
                  >
                    Save
                  </Button>
                </div>
                <AnimatePresence>
                  {nameSaved && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-sm text-success font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Saved
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* Cloud sync */}
        {user && (
          <div className="card-premium p-5">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                Cloud sync
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Your data is automatically synced to Supabase when you use the
              app. If you had data before signing in, use the button below to
              import it.
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={handleManualMigration}
              disabled={isMigrating}
              className={cn(migrationDone && 'border-success/40 text-success')}
            >
              {isMigrating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Importing…
                </>
              ) : migrationDone ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Import complete
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Import local data to cloud
                </>
              )}
            </Button>

            {migrationError && (
              <p className="text-xs text-muted-foreground mt-2">{migrationError}</p>
            )}
          </div>
        )}

        {/* Data summary */}
        <div className="card-premium p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              {user ? 'Local cache' : 'Local data'}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {dataStats.map(({ label, value }) => (
              <div key={label} className="p-4 rounded-xl bg-muted">
                <div className="text-lg font-semibold stat-number text-foreground">
                  {value}
                </div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {user
              ? 'Local state acts as a fast cache. Changes sync to Supabase in the background.'
              : 'All data is stored locally in your browser.'}
          </p>
        </div>

        {/* App info */}
        <div className="card-premium p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <Zap
                className="w-3.5 h-3.5 text-primary-foreground"
                strokeWidth={2.5}
              />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Apex</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            A premium training and nutrition command center for measurable
            progress.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              v1.0
            </span>
            <span className="text-[11px] text-muted-foreground">
              {user ? 'Cloud-backed · Supabase · Vercel' : 'Local-first · Vercel-ready'}
            </span>
          </div>
        </div>

        {/* Sign out */}
        {user && (
          <div className="card-premium p-5">
            <div className="flex items-center gap-2 mb-3">
              <LogOut className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Sign out</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              You&apos;ll be redirected to the sign-in page. Your data is saved
              to the cloud.
            </p>
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-muted"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Sign out
              </Button>
            </form>
          </div>
        )}

        {/* Danger zone */}
        <div className="card-premium p-5 border-destructive/30">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="w-4 h-4 text-destructive" />
            <h2 className="text-sm font-semibold text-foreground">
              Reset local cache
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Clears the browser cache. Your cloud data in Supabase is not
            affected. The page will reload.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => {
              if (
                confirm(
                  'Clear the local browser cache? Your Supabase data is safe.'
                )
              ) {
                localStorage.clear()
                window.location.reload()
              }
            }}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear local cache
          </Button>
        </div>
      </div>
    </div>
  )
}
