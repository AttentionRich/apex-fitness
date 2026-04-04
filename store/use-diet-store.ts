'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MealEntry, SavedMeal, DailyNutritionSummary, CalorieTrendPoint } from '@/types/diet'
import { SEED_SAVED_MEALS, SEED_MEAL_ENTRIES } from '@/lib/mock/seed-data'
import { format, subDays } from 'date-fns'

type DietStore = {
  mealEntries: MealEntry[]
  savedMeals: SavedMeal[]
  isSeeded: boolean

  // Meal entry actions
  addMealEntry: (entry: MealEntry) => void
  updateMealEntry: (entry: MealEntry) => void
  deleteMealEntry: (id: string) => void

  // Saved meal actions
  addSavedMeal: (meal: SavedMeal) => void
  updateSavedMeal: (meal: SavedMeal) => void
  deleteSavedMeal: (id: string) => void
  incrementMealUseCount: (id: string) => void

  // Seed
  seedData: () => void

  // Selectors
  getDayEntries: (date: string) => MealEntry[]
  getDailySummary: (date: string, targetCalories: number) => DailyNutritionSummary
  getCalorieTrend: (targetCalories: number, days?: number) => CalorieTrendPoint[]
  getSuggestedMeals: (remainingCalories: number, mealType?: string) => SavedMeal[]
  getFrequentMeals: (limit?: number) => SavedMeal[]
  getWeeklyAdherence: (targetCalories: number) => number // percentage 0-100
}

export const useDietStore = create<DietStore>()(
  persist(
    (set, get) => ({
      mealEntries: [],
      savedMeals: [],
      isSeeded: false,

      addMealEntry: (entry) =>
        set((state) => ({ mealEntries: [...state.mealEntries, entry] })),

      updateMealEntry: (entry) =>
        set((state) => ({
          mealEntries: state.mealEntries.map((e) => (e.id === entry.id ? entry : e)),
        })),

      deleteMealEntry: (id) =>
        set((state) => ({
          mealEntries: state.mealEntries.filter((e) => e.id !== id),
        })),

      addSavedMeal: (meal) =>
        set((state) => ({ savedMeals: [...state.savedMeals, meal] })),

      updateSavedMeal: (meal) =>
        set((state) => ({
          savedMeals: state.savedMeals.map((m) => (m.id === meal.id ? meal : m)),
        })),

      deleteSavedMeal: (id) =>
        set((state) => ({
          savedMeals: state.savedMeals.filter((m) => m.id !== id),
        })),

      incrementMealUseCount: (id) =>
        set((state) => ({
          savedMeals: state.savedMeals.map((m) =>
            m.id === id
              ? { ...m, useCount: m.useCount + 1, lastUsedAt: new Date().toISOString() }
              : m
          ),
        })),

      seedData: () => {
        if (get().isSeeded) return
        set({
          savedMeals: SEED_SAVED_MEALS,
          mealEntries: SEED_MEAL_ENTRIES,
          isSeeded: true,
        })
      },

      getDayEntries: (date) => {
        return get().mealEntries.filter((e) => e.date === date)
      },

      getDailySummary: (date, targetCalories) => {
        const meals = get().getDayEntries(date)
        const consumed = meals.reduce((sum, m) => sum + m.calories, 0)
        return {
          date,
          targetCalories,
          consumedCalories: consumed,
          remainingCalories: Math.max(0, targetCalories - consumed),
          meals,
          adherent: Math.abs(consumed - targetCalories) <= 150,
        }
      },

      getCalorieTrend: (targetCalories, days = 14) => {
        const today = new Date()
        return Array.from({ length: days }, (_, i) => {
          const date = format(subDays(today, days - 1 - i), 'yyyy-MM-dd')
          const entries = get().getDayEntries(date)
          const consumed = entries.reduce((sum, m) => sum + m.calories, 0)
          return {
            date,
            consumed,
            target: targetCalories,
            adherent: consumed > 0 && Math.abs(consumed - targetCalories) <= 150,
          }
        })
      },

      getSuggestedMeals: (remainingCalories, mealType) => {
        const { savedMeals } = get()
        const scored = savedMeals.map((meal) => {
          let score = 0
          // Frequency bonus
          score += Math.min(meal.useCount * 2, 20)
          // Calorie fit (within 100 kcal of remaining or less)
          const calorieDiff = Math.abs(meal.defaultCalories - remainingCalories)
          if (calorieDiff <= 100) score += 30
          else if (calorieDiff <= 200) score += 15
          else if (meal.defaultCalories > remainingCalories) score -= 20
          // Meal type match
          if (mealType && meal.mealType === mealType) score += 15
          // Recency boost
          if (meal.lastUsedAt) {
            const daysSinceUse =
              (Date.now() - new Date(meal.lastUsedAt).getTime()) / 86400000
            if (daysSinceUse < 7) score += 10
          }
          return { meal, score }
        })
        return scored
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
          .map((s) => s.meal)
      },

      getFrequentMeals: (limit = 5) => {
        return [...get().savedMeals]
          .sort((a, b) => b.useCount - a.useCount)
          .slice(0, limit)
      },

      getWeeklyAdherence: (targetCalories) => {
        const today = new Date()
        let adherentDays = 0
        let totalDaysWithData = 0
        for (let i = 0; i < 7; i++) {
          const date = format(subDays(today, i), 'yyyy-MM-dd')
          const entries = get().getDayEntries(date)
          if (entries.length > 0) {
            totalDaysWithData++
            const consumed = entries.reduce((sum, m) => sum + m.calories, 0)
            if (Math.abs(consumed - targetCalories) <= 150) adherentDays++
          }
        }
        if (totalDaysWithData === 0) return 0
        return Math.round((adherentDays / totalDaysWithData) * 100)
      },
    }),
    { name: 'apex-diet-store' }
  )
)
