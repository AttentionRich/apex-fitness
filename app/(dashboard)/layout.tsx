'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { useTrainingStore } from '@/store/use-training-store'
import { useDietStore } from '@/store/use-diet-store'

export default function DashboardLayout({
  children,
}: {
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
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
