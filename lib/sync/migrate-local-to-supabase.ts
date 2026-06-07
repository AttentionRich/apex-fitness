'use client'

// One-time migration: reads localStorage Zustand state and pushes it to
// Supabase. Idempotent — safe to call multiple times (skips if data already
// exists in Supabase).

import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import type { TrainingProgram, WorkoutLog } from '@/types/training'
import type { SavedMeal, MealEntry } from '@/types/diet'
import type { UserProfile } from '@/types/profile'

type LocalTrainingStore = {
  programs: TrainingProgram[]
  activeProgramId: string | null
  workoutLogs: WorkoutLog[]
}

type LocalDietStore = {
  mealEntries: MealEntry[]
  savedMeals: SavedMeal[]
}

type LocalProfileStore = {
  profile: UserProfile | null
}

function readLocalStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return (parsed.state as T) ?? null
  } catch {
    return null
  }
}

export type MigrationResult = {
  programs: number
  workoutSessions: number
  savedMeals: number
  mealEntries: number
  profileSynced: boolean
  skipped: boolean
}

export async function migrateLocalDataToSupabase(
  userId: string
): Promise<MigrationResult> {
  const supabase = createSupabaseBrowserClient()

  const result: MigrationResult = {
    programs: 0,
    workoutSessions: 0,
    savedMeals: 0,
    mealEntries: 0,
    profileSynced: false,
    skipped: false,
  }

  // Check if the user already has Supabase data — if so, skip migration
  const { count: existingPrograms } = await supabase
    .from('training_programs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (existingPrograms && existingPrograms > 0) {
    result.skipped = true
    return result
  }

  // ─── Profile ──────────────────────────────────────────────────────────────

  const profileStore = readLocalStorage<LocalProfileStore>('apex-profile-store')
  const localProfile = profileStore?.profile

  if (localProfile) {
    const goalMap: Record<string, 'maintain' | 'lose' | 'gain'> = {
      maintain: 'maintain',
      mild_cut: 'lose',
      moderate_cut: 'lose',
      aggressive_cut: 'lose',
    }

    const activityMap: Record<
      string,
      'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
    > = {
      sedentary: 'sedentary',
      light: 'light',
      moderate: 'moderate',
      active: 'active',
      very_active: 'very_active',
    }

    await supabase.from('profiles').update({
      display_name: localProfile.name ?? null,
    }).eq('id', userId)

    if (localProfile.calorieTarget || localProfile.maintenanceCalories) {
      await supabase.from('nutrition_profiles').update({
        goal: goalMap[localProfile.goalType ?? 'maintain'] ?? 'maintain',
        activity_level:
          activityMap[localProfile.activityLevel ?? 'moderate'] ?? 'moderate',
        height_cm: localProfile.heightCm ?? null,
        current_weight_kg: localProfile.weightKg ?? null,
        maintenance_calories: localProfile.maintenanceCalories ?? null,
        target_calories: localProfile.calorieTarget ?? null,
      }).eq('user_id', userId)
    }

    result.profileSynced = true
  }

  // ─── Training Programs ────────────────────────────────────────────────────

  const trainingStore =
    readLocalStorage<LocalTrainingStore>('apex-training-store')

  if (trainingStore?.programs && trainingStore.programs.length > 0) {
    // Map local IDs → Supabase UUIDs so we can link days and exercises
    const programIdMap = new Map<string, string>()
    const dayIdMap = new Map<string, string>()

    for (const program of trainingStore.programs) {
      const isActive = program.id === trainingStore.activeProgramId

      const { data: dbProgram } = await supabase
        .from('training_programs')
        .insert({
          user_id: userId,
          name: program.name,
          description: program.description ?? null,
          is_active: isActive,
          started_on: program.startDate
            ? program.startDate.slice(0, 10)
            : null,
        })
        .select()
        .single()

      if (!dbProgram) continue
      programIdMap.set(program.id, dbProgram.id)
      result.programs++

      // Insert days (from weeks[0] — current app uses a single week)
      const week = program.weeks?.[0]
      if (!week) continue

      for (const day of week.workoutDays) {
        const { data: dbDay } = await supabase
          .from('training_program_days')
          .insert({
            program_id: dbProgram.id,
            day_index: day.dayIndex + 1, // schema is 1-7, app is 0-6
            label: day.name,
          })
          .select()
          .single()

        if (!dbDay) continue
        dayIdMap.set(day.id, dbDay.id)

        // Insert exercises
        if (day.exercises.length > 0) {
          const exerciseInserts = day.exercises.map((ex) => ({
            program_day_id: dbDay.id,
            exercise_name_snapshot: ex.exerciseId, // use ID as fallback name
            order_index: ex.order,
            prescribed_sets: ex.plannedSets,
            rep_min: ex.repRangeMin ?? null,
            rep_max: ex.repRangeMax ?? null,
            rest_seconds: ex.restSeconds ?? null,
            progression_mode:
              (ex.progressionType === 'double_progression'
                ? 'double_progression'
                : ex.progressionType === 'fixed_jump'
                ? 'fixed_increment'
                : 'manual') as
                | 'double_progression'
                | 'fixed_increment'
                | 'manual',
          }))

          await supabase.from('training_program_exercises').insert(exerciseInserts)
        }
      }
    }

    // ─── Workout Logs ──────────────────────────────────────────────────────

    if (trainingStore.workoutLogs && trainingStore.workoutLogs.length > 0) {
      for (const log of trainingStore.workoutLogs) {
        const dbProgramId = programIdMap.get(log.programId) ?? null
        const dbDayId = dayIdMap.get(log.workoutDayId) ?? null

        const { data: dbSession } = await supabase
          .from('workout_sessions')
          .insert({
            user_id: userId,
            program_id: dbProgramId,
            program_day_id: dbDayId,
            performed_on: log.date,
            duration_minutes: log.durationMinutes ?? null,
            completed_at: log.completed ? new Date().toISOString() : null,
          })
          .select()
          .single()

        if (!dbSession) continue
        result.workoutSessions++

        if (log.exerciseLogs.length > 0) {
          const elInserts = log.exerciseLogs.map((el, i) => ({
            workout_session_id: dbSession.id,
            exercise_name_snapshot: el.exerciseId,
            order_index: i,
          }))

          const { data: dbEls } = await supabase
            .from('workout_exercise_logs')
            .insert(elInserts)
            .select()

          if (dbEls) {
            const setInserts = dbEls.flatMap((dbEl, i) => {
              const el = log.exerciseLogs[i]
              return el.sets.map((s) => ({
                workout_exercise_log_id: dbEl.id,
                set_number: s.setNumber,
                reps: s.reps ?? null,
                weight_kg: s.weight ?? null,
                completed: s.completed,
              }))
            })

            if (setInserts.length > 0) {
              await supabase.from('workout_set_logs').insert(setInserts)
            }
          }
        }
      }
    }
  }

  // ─── Diet: Saved Meals (Meal Templates) ───────────────────────────────────

  const dietStore = readLocalStorage<LocalDietStore>('apex-diet-store')

  if (dietStore?.savedMeals && dietStore.savedMeals.length > 0) {
    const mealSlotMap: Record<string, 'breakfast' | 'lunch' | 'dinner' | 'snack'> =
      {
        breakfast: 'breakfast',
        lunch: 'lunch',
        dinner: 'dinner',
        snack: 'snack',
      }

    // Filter out seed meals (they come from SEED_SAVED_MEALS and are generic)
    const templateInserts = dietStore.savedMeals.map((m) => ({
      user_id: userId,
      name: m.name,
      meal_slot: mealSlotMap[m.mealType ?? ''] ?? null,
      default_calories: m.defaultCalories,
      default_protein_g: m.protein ?? null,
      default_carbs_g: m.carbs ?? null,
      default_fat_g: m.fats ?? null,
      use_count: m.useCount ?? 0,
      last_used_at: m.lastUsedAt ?? null,
    }))

    const { data: inserted } = await supabase
      .from('meal_templates')
      .insert(templateInserts)
      .select()

    result.savedMeals = inserted?.length ?? 0
  }

  // ─── Diet: Meal Entries (Food Log) ────────────────────────────────────────

  if (dietStore?.mealEntries && dietStore.mealEntries.length > 0) {
    const mealSlotMap: Record<string, 'breakfast' | 'lunch' | 'dinner' | 'snack'> =
      {
        breakfast: 'breakfast',
        lunch: 'lunch',
        dinner: 'dinner',
        snack: 'snack',
      }

    const entryInserts = dietStore.mealEntries
      .filter((e) => mealSlotMap[e.mealType]) // skip any invalid meal types
      .map((e) => ({
        user_id: userId,
        logged_for_date: e.date,
        meal_slot: mealSlotMap[e.mealType]!,
        item_name: e.name,
        calories: e.calories,
        protein_g: e.protein ?? 0,
        carbs_g: e.carbs ?? 0,
        fat_g: e.fats ?? 0,
        source: 'migrated',
      }))

    if (entryInserts.length > 0) {
      const { data: inserted } = await supabase
        .from('food_log_entries')
        .insert(entryInserts)
        .select()
      result.mealEntries = inserted?.length ?? 0
    }
  }

  return result
}
