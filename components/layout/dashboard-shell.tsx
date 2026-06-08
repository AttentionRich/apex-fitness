'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { DataMigrationTrigger } from '@/components/sync/data-migration-trigger'
import { useTrainingStore } from '@/store/use-training-store'
import { useDietStore } from '@/store/use-diet-store'

type ShellUser = {
  id: string
  email: string | null
  displayName: string | null
} | null

export function DashboardShell({
  user,
  children,
}: {
  user: ShellUser
  children: React.ReactNode
}) {
  // Seed demo data after store hydration is confirmed.
  // Uses persist.hasHydrated() + onFinishHydration() to avoid the Zustand v5
  // async-rehydration race where isSeeded is still false at first render.
  useEffect(() => {
    function trySeedTraining() {
      if (!useTrainingStore.getState().isSeeded) useTrainingStore.getState().seedData()
    }
    function trySeedDiet() {
      if (!useDietStore.getState().isSeeded) useDietStore.getState().seedData()
    }

    let unsubTraining: (() => void) | undefined
    let unsubDiet: (() => void) | undefined

    if (useTrainingStore.persist.hasHydrated()) {
      trySeedTraining()
    } else {
      unsubTraining = useTrainingStore.persist.onFinishHydration(trySeedTraining)
    }

    if (useDietStore.persist.hasHydrated()) {
      trySeedDiet()
    } else {
      unsubDiet = useDietStore.persist.onFinishHydration(trySeedDiet)
    }

    return () => {
      unsubTraining?.()
      unsubDiet?.()
    }
  }, [])

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-24 lg:pb-0">
          {children}
        </div>
      </main>
      <MobileNav />
      {/* Fire one-time localStorage → Supabase migration for authenticated users */}
      {user && <DataMigrationTrigger userId={user.id} />}
    </div>
  )
}
