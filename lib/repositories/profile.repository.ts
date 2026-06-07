import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/types'

export async function getProfile(userId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(
  userId: string,
  updates: TablesUpdate<'profiles'>
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getNutritionProfile(userId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('nutrition_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function upsertNutritionProfile(
  userId: string,
  values: Omit<TablesInsert<'nutrition_profiles'>, 'user_id'>
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('nutrition_profiles')
    .upsert({ ...values, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserPreferences(userId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateUserPreferences(
  userId: string,
  updates: TablesUpdate<'user_preferences'>
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('user_preferences')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
