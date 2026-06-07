import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/types'

// ─── Training Programs ────────────────────────────────────────────────────────

export async function getTrainingPrograms(userId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('training_programs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getActiveProgram(userId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('training_programs')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (error?.code === 'PGRST116') return null
  if (error) throw error
  return data
}

export async function insertTrainingProgram(
  userId: string,
  program: Omit<TablesInsert<'training_programs'>, 'user_id'>
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('training_programs')
    .insert({ ...program, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTrainingProgram(
  userId: string,
  programId: string,
  updates: TablesUpdate<'training_programs'>
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('training_programs')
    .update(updates)
    .eq('id', programId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function setActiveProgram(userId: string, programId: string) {
  const supabase = await createSupabaseServerClient()

  // Deactivate all programs for this user, then activate the selected one.
  // The unique partial index enforces only one active program per user.
  const { error: deactivateError } = await supabase
    .from('training_programs')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true)

  if (deactivateError) throw deactivateError

  const { error: activateError } = await supabase
    .from('training_programs')
    .update({ is_active: true })
    .eq('id', programId)
    .eq('user_id', userId)

  if (activateError) throw activateError
}

export async function deleteTrainingProgram(userId: string, programId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('training_programs')
    .delete()
    .eq('id', programId)
    .eq('user_id', userId)

  if (error) throw error
}

// ─── Training Program Days ────────────────────────────────────────────────────

export async function getProgramDays(programId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('training_program_days')
    .select('*')
    .eq('program_id', programId)
    .order('day_index', { ascending: true })

  if (error) throw error
  return data
}

export async function insertProgramDay(
  day: TablesInsert<'training_program_days'>
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('training_program_days')
    .insert(day)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function insertProgramDays(
  days: TablesInsert<'training_program_days'>[]
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('training_program_days')
    .insert(days)
    .select()

  if (error) throw error
  return data
}

export async function deleteProgramDay(dayId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('training_program_days')
    .delete()
    .eq('id', dayId)

  if (error) throw error
}

// ─── Training Program Exercises ───────────────────────────────────────────────

export async function getProgramDayExercises(programDayId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('training_program_exercises')
    .select('*')
    .eq('program_day_id', programDayId)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data
}

export async function insertProgramExercises(
  exercises: TablesInsert<'training_program_exercises'>[]
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('training_program_exercises')
    .insert(exercises)
    .select()

  if (error) throw error
  return data
}

export async function updateProgramExercise(
  exerciseId: string,
  updates: TablesUpdate<'training_program_exercises'>
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('training_program_exercises')
    .update(updates)
    .eq('id', exerciseId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProgramExercise(exerciseId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('training_program_exercises')
    .delete()
    .eq('id', exerciseId)

  if (error) throw error
}

// ─── Workout Sessions ─────────────────────────────────────────────────────────

export async function getWorkoutSessions(userId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      workout_exercise_logs (
        *,
        workout_set_logs (*)
      )
    `)
    .eq('user_id', userId)
    .order('performed_on', { ascending: false })

  if (error) throw error
  return data
}

export async function getWorkoutSessionsForDateRange(
  userId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      workout_exercise_logs (
        *,
        workout_set_logs (*)
      )
    `)
    .eq('user_id', userId)
    .gte('performed_on', startDate)
    .lte('performed_on', endDate)
    .order('performed_on', { ascending: false })

  if (error) throw error
  return data
}

export async function insertWorkoutSession(
  userId: string,
  session: Omit<TablesInsert<'workout_sessions'>, 'user_id'>
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({ ...session, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateWorkoutSession(
  userId: string,
  sessionId: string,
  updates: TablesUpdate<'workout_sessions'>
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('workout_sessions')
    .update(updates)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteWorkoutSession(userId: string, sessionId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (error) throw error
}

// ─── Workout Exercise Logs ────────────────────────────────────────────────────

export async function insertWorkoutExerciseLogs(
  logs: TablesInsert<'workout_exercise_logs'>[]
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('workout_exercise_logs')
    .insert(logs)
    .select()

  if (error) throw error
  return data
}

// ─── Workout Set Logs ─────────────────────────────────────────────────────────

export async function insertWorkoutSetLogs(
  sets: TablesInsert<'workout_set_logs'>[]
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('workout_set_logs')
    .insert(sets)
    .select()

  if (error) throw error
  return data
}

export async function upsertWorkoutSetLog(
  set: TablesInsert<'workout_set_logs'>
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('workout_set_logs')
    .upsert(set, { onConflict: 'workout_exercise_log_id,set_number' })
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Exercise Catalog ─────────────────────────────────────────────────────────

export async function getExerciseCatalog() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('exercise_catalog')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}
