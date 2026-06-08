'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WaterEntry, WaterTrendPoint } from '@/types/water'
import { generateId } from '@/lib/utils/format'
import { getTodayString } from '@/lib/utils/date'
import { format, subDays } from 'date-fns'

type WaterStore = {
  waterEntries: WaterEntry[]

  addWaterEntry: (amountMl: number) => void
  deleteWaterEntry: (id: string) => void

  getDayEntries: (date: string) => WaterEntry[]
  getDayIntake: (date: string) => number
  getWaterTrend: (targetMl: number, days?: number) => WaterTrendPoint[]
}

export const useWaterStore = create<WaterStore>()(
  persist(
    (set, get) => ({
      waterEntries: [],

      addWaterEntry: (amountMl) => {
        const entry: WaterEntry = {
          id: generateId(),
          date: getTodayString(),
          amountMl,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ waterEntries: [...state.waterEntries, entry] }))
      },

      deleteWaterEntry: (id) =>
        set((state) => ({
          waterEntries: state.waterEntries.filter((e) => e.id !== id),
        })),

      getDayEntries: (date) =>
        get().waterEntries.filter((e) => e.date === date),

      getDayIntake: (date) =>
        get().waterEntries
          .filter((e) => e.date === date)
          .reduce((sum, e) => sum + e.amountMl, 0),

      getWaterTrend: (targetMl, days = 14) => {
        const today = new Date()
        return Array.from({ length: days }, (_, i) => {
          const date = format(subDays(today, days - 1 - i), 'yyyy-MM-dd')
          const consumed = get().getDayIntake(date)
          return { date, consumed, target: targetMl }
        })
      },
    }),
    { name: 'apex-water-store' }
  )
)
