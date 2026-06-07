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
  const { seedData: seedTraining, isSeeded: trainingSeeded } = useTrainingStore()
  const { seedData: seedDiet, isSeeded: dietSeeded } = useDietStore()

  // Seed demo data on first load only
  useEffect(() => {
    if (!trainingSeeded) seedTraining()
    if (!dietSeeded) seedDiet()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
