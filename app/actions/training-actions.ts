'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { TablesInsert } from '@/lib/supabase/types'

// All actions validate session internally — never trust client-supplied user_id.

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  return { supabase, userId: user.id }
}

// ─── Programs ─────────────────────────────────────────────────────────────────

export async function createProgramAction(input: {
  name: string
  description?: string
  isActive?: boolean
}) {
  const { supabase, userId } = await requireUser()
  const { data, error } = await supabase
    .from('training_programs')
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description ?? null,
      is_active: input.isActive ?? false,
    })
    .select()
    .single()
  if (error) return { error: error.message }
  return { data }
}

export async function updateProgramAction(input: {
  id: string
  name?: string
  description?: string
  isActive?: boolean
}) {
  const { supabase, userId } = await requireUser()
  const { data, error } = await supabase
    .from('training_programs')
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.isActive !== undefined && { is_active: input.isActive }),
    })
    .eq('id', input.id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return { error: error.message }
  return { data }
}

export async function deleteProgramAction(programId: string) {
  const { supabase, userId } = await requireUser()
  const { error } = await supabase
    .from('training_programs')
    .delete()
    .eq('id', programId)
    .eq('user_id', userId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function setActiveProgramAction(programId: string) {
  const { supabase, userId } = await requireUser()

  // Deactivate all first
  await supabase
    .from('training_programs')
    .update({ is_active: false })
    .eq('user_id', userId)

  const { error } = await supabase
    .from('training_programs')
    .update({ is_active: true })
    .eq('id', programId)
    .eq('user_id', userId)

  if (error) return { error: error.message }
  return { success: true }
}

// ─── Workout Sessions ─────────────────────────────────────────────────────────

export async function saveWorkoutSessionAction(input: {
  programId?: string | null
  programDayId?: string | null
  performedOn: string          // YYYY-MM-DD
  startedAt?: string | null
  completedAt?: string | null
  durationMinutes?: number | null
  notes?: string | null
  exerciseLogs: {
    trainingProgramExerciseId?: string | null
    exerciseNameSnapshot: string
    orderIndex: number
    sets: {
      setNumber: number
      reps?: number | null
      weightKg?: number | null
      rpe?: number | null
      isWarmup?: boolean
      completed?: boolean
    }[]
  }[]
}) {
  const { supabase, userId } = await requireUser()

  // Insert session
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userId,
      program_id: input.programId ?? null,
      program_day_id: input.programDayId ?? null,
      performed_on: input.performedOn,
      started_at: input.startedAt ?? null,
      completed_at: input.completedAt ?? null,
      duration_minutes: input.durationMinutes ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single()

  if (sessionError) return { error: sessionError.message }

  // Insert exercise logs
  if (input.exerciseLogs.length > 0) {
    const exerciseLogInserts: TablesInsert<'workout_exercise_logs'>[] =
      input.exerciseLogs.map((el) => ({
        workout_session_id: session.id,
        training_program_exercise_id: el.trainingProgramExerciseId ?? null,
        exercise_name_snapshot: el.exerciseNameSnapshot,
        order_index: el.orderIndex,
      }))

    const { data: exerciseLogs, error: elError } = await supabase
      .from('workout_exercise_logs')
      .insert(exerciseLogInserts)
      .select()

    if (elError) return { error: elError.message }

    // Insert set logs
    const setInserts: TablesInsert<'workout_set_logs'>[] = []
    for (let i = 0; i < input.exerciseLogs.length; i++) {
      const el = input.exerciseLogs[i]
      const dbEl = exerciseLogs[i]
      for (const set of el.sets) {
        setInserts.push({
          workout_exercise_log_id: dbEl.id,
          set_number: set.setNumber,
          reps: set.reps ?? null,
          weight_kg: set.weightKg ?? null,
          rpe: set.rpe ?? null,
          is_warmup: set.isWarmup ?? false,
          completed: set.completed ?? true,
        })
      }
    }

    if (setInserts.length > 0) {
      const { error: setError } = await supabase
        .from('workout_set_logs')
        .insert(setInserts)
      if (setError) return { error: setError.message }
    }
  }

  return { data: { sessionId: session.id } }
}

export async function deleteWorkoutSessionAction(sessionId: string) {
  const { supabase, userId } = await requireUser()
  const { error } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId)
  if (error) return { error: error.message }
  return { success: true }
}
