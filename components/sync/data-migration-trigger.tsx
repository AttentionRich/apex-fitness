'use client'

// Mounts inside the authenticated dashboard shell.
// On first render for a new authenticated user, fires the one-time migration
// from localStorage → Supabase. Uses a localStorage flag to avoid re-running.

import { useEffect, useRef } from 'react'
import { migrateLocalDataToSupabase } from '@/lib/sync/migrate-local-to-supabase'

const MIGRATION_FLAG = 'apex-supabase-migrated-v1'

export function DataMigrationTrigger({ userId }: { userId: string }) {
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const alreadyMigrated = localStorage.getItem(MIGRATION_FLAG)
    if (alreadyMigrated) return

    migrateLocalDataToSupabase(userId)
      .then((result) => {
        if (!result.skipped) {
          localStorage.setItem(MIGRATION_FLAG, 'true')
        }
      })
      .catch(() => {
        // Migration is best-effort — silently fail; local data still works
      })
  }, [userId])

  return null
}
