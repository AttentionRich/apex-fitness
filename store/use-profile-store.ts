'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProfile, GoalType } from '@/types/profile'

type ProfileStore = {
  profile: UserProfile | null
  isOnboarded: boolean
  updateProfile: (updates: Partial<UserProfile>) => void
  setCalorieTarget: (goalType: GoalType, calories: number, maintenance: number) => void
  setCustomCalorieTarget: (calories: number | null) => void
  clearProfile: () => void
  completeOnboarding: () => void
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'local-user',
  name: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      isOnboarded: false,

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, ...updates, updatedAt: new Date().toISOString() }
            : { ...DEFAULT_PROFILE, ...updates, updatedAt: new Date().toISOString() },
        })),

      setCalorieTarget: (goalType, calories, maintenance) =>
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                goalType,
                calorieTarget: calories,
                maintenanceCalories: maintenance,
                updatedAt: new Date().toISOString(),
              }
            : DEFAULT_PROFILE,
        })),

      setCustomCalorieTarget: (calories) =>
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                customCalorieTarget: calories ?? undefined,
                updatedAt: new Date().toISOString(),
              }
            : DEFAULT_PROFILE,
        })),

      clearProfile: () =>
        set({ profile: DEFAULT_PROFILE, isOnboarded: false }),

      completeOnboarding: () => set({ isOnboarded: true }),
    }),
    { name: 'apex-profile-store' }
  )
)
