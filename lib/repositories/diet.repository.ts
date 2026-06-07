import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/types'

// ─── Food Log Entries ─────────────────────────────────────────────────────────

export async function getFoodLogEntriesForDate(userId: string, date: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('food_log_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('logged_for_date', date)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function getFoodLogEntriesForDateRange(
  userId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('food_log_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_for_date', startDate)
    .lte('logged_for_date', endDate)
    .order('logged_for_date', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function insertFoodLogEntry(
  userId: string,
  entry: Omit<TablesInsert<'food_log_entries'>, 'user_id'>
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('food_log_entries')
    .insert({ ...entry, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function insertFoodLogEntries(
  userId: string,
  entries: Omit<TablesInsert<'food_log_entries'>, 'user_id'>[]
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('food_log_entries')
    .insert(entries.map((e) => ({ ...e, user_id: userId })))
    .select()

  if (error) throw error
  return data
}

export async function updateFoodLogEntry(
  userId: string,
  entryId: string,
  updates: TablesUpdate<'food_log_entries'>
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('food_log_entries')
    .update(updates)
    .eq('id', entryId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteFoodLogEntry(userId: string, entryId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('food_log_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId)

  if (error) throw error
}

// ─── Meal Templates ───────────────────────────────────────────────────────────

export async function getMealTemplates(userId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('meal_templates')
    .select('*')
    .eq('user_id', userId)
    .order('use_count', { ascending: false })

  if (error) throw error
  return data
}

export async function insertMealTemplate(
  userId: string,
  template: Omit<TablesInsert<'meal_templates'>, 'user_id'>
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('meal_templates')
    .insert({ ...template, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function insertMealTemplates(
  userId: string,
  templates: Omit<TablesInsert<'meal_templates'>, 'user_id'>[]
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('meal_templates')
    .insert(templates.map((t) => ({ ...t, user_id: userId })))
    .select()

  if (error) throw error
  return data
}

export async function updateMealTemplate(
  userId: string,
  templateId: string,
  updates: TablesUpdate<'meal_templates'>
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('meal_templates')
    .update(updates)
    .eq('id', templateId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function incrementMealTemplateUseCount(
  userId: string,
  templateId: string
) {
  const supabase = await createSupabaseServerClient()
  // Atomic increment via RPC-style update
  const { data: current } = await supabase
    .from('meal_templates')
    .select('use_count')
    .eq('id', templateId)
    .eq('user_id', userId)
    .single()

  if (!current) return

  const { error } = await supabase
    .from('meal_templates')
    .update({
      use_count: current.use_count + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function deleteMealTemplate(userId: string, templateId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('meal_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', userId)

  if (error) throw error
}

// ─── Daily nutrition summary (via view) ──────────────────────────────────────

export async function getDailyNutritionSummary(userId: string, date: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('daily_nutrition_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('logged_for_date', date)
    .single()

  // No row just means no entries logged yet — not an error
  if (error?.code === 'PGRST116') return null
  if (error) throw error
  return data
}

export async function getNutritionTrend(
  userId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('daily_nutrition_summary')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_for_date', startDate)
    .lte('logged_for_date', endDate)
    .order('logged_for_date', { ascending: true })

  if (error) throw error
  return data ?? []
}
