'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  return { supabase, userId: user.id }
}

// ─── Food Log Entries ─────────────────────────────────────────────────────────

export async function addFoodLogEntryAction(input: {
  loggedForDate: string
  mealSlot: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  itemName: string
  calories: number
  proteinG?: number
  carbsG?: number
  fatG?: number
  servingUnit?: string
  source?: string
}) {
  const { supabase, userId } = await requireUser()

  const { data, error } = await supabase
    .from('food_log_entries')
    .insert({
      user_id: userId,
      logged_for_date: input.loggedForDate,
      meal_slot: input.mealSlot,
      item_name: input.itemName,
      calories: input.calories,
      protein_g: input.proteinG ?? 0,
      carbs_g: input.carbsG ?? 0,
      fat_g: input.fatG ?? 0,
      serving_unit: input.servingUnit ?? null,
      source: input.source ?? 'manual',
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function deleteFoodLogEntryAction(entryId: string) {
  const { supabase, userId } = await requireUser()
  const { error } = await supabase
    .from('food_log_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId)
  if (error) return { error: error.message }
  return { success: true }
}

// ─── Meal Templates (Saved Meals) ─────────────────────────────────────────────

export async function addMealTemplateAction(input: {
  name: string
  mealSlot?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  defaultCalories: number
  defaultProteinG?: number
  defaultCarbsG?: number
  defaultFatG?: number
}) {
  const { supabase, userId } = await requireUser()

  const { data, error } = await supabase
    .from('meal_templates')
    .insert({
      user_id: userId,
      name: input.name,
      meal_slot: input.mealSlot ?? null,
      default_calories: input.defaultCalories,
      default_protein_g: input.defaultProteinG ?? null,
      default_carbs_g: input.defaultCarbsG ?? null,
      default_fat_g: input.defaultFatG ?? null,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updateMealTemplateAction(
  templateId: string,
  updates: {
    name?: string
    mealSlot?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
    defaultCalories?: number
    defaultProteinG?: number | null
    defaultCarbsG?: number | null
    defaultFatG?: number | null
  }
) {
  const { supabase, userId } = await requireUser()

  const { data, error } = await supabase
    .from('meal_templates')
    .update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.mealSlot !== undefined && { meal_slot: updates.mealSlot }),
      ...(updates.defaultCalories !== undefined && {
        default_calories: updates.defaultCalories,
      }),
      ...(updates.defaultProteinG !== undefined && {
        default_protein_g: updates.defaultProteinG,
      }),
      ...(updates.defaultCarbsG !== undefined && {
        default_carbs_g: updates.defaultCarbsG,
      }),
      ...(updates.defaultFatG !== undefined && {
        default_fat_g: updates.defaultFatG,
      }),
    })
    .eq('id', templateId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function deleteMealTemplateAction(templateId: string) {
  const { supabase, userId } = await requireUser()
  const { error } = await supabase
    .from('meal_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', userId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function incrementMealTemplateUseCountAction(templateId: string) {
  const { supabase, userId } = await requireUser()

  // Read current count, then write (Supabase JS v2 has no atomic increment via client)
  const { data: current } = await supabase
    .from('meal_templates')
    .select('use_count')
    .eq('id', templateId)
    .eq('user_id', userId)
    .single()

  if (!current) return { error: 'Not found' }

  const { error } = await supabase
    .from('meal_templates')
    .update({
      use_count: current.use_count + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .eq('user_id', userId)

  if (error) return { error: error.message }
  return { success: true }
}

// ─── Nutrition Profile ────────────────────────────────────────────────────────

export async function updateNutritionProfileAction(updates: {
  goal?: 'maintain' | 'lose' | 'gain'
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  sex?: string | null
  birthYear?: number | null
  heightCm?: number | null
  currentWeightKg?: number | null
  targetWeightKg?: number | null
  weeklyWeightChangeKg?: number | null
  maintenanceCalories?: number | null
  targetCalories?: number | null
  proteinTargetG?: number | null
  carbsTargetG?: number | null
  fatTargetG?: number | null
}) {
  const { supabase, userId } = await requireUser()

  const { data, error } = await supabase
    .from('nutrition_profiles')
    .update({
      ...(updates.goal !== undefined && { goal: updates.goal }),
      ...(updates.activityLevel !== undefined && {
        activity_level: updates.activityLevel,
      }),
      ...(updates.sex !== undefined && { sex: updates.sex }),
      ...(updates.birthYear !== undefined && { birth_year: updates.birthYear }),
      ...(updates.heightCm !== undefined && { height_cm: updates.heightCm }),
      ...(updates.currentWeightKg !== undefined && {
        current_weight_kg: updates.currentWeightKg,
      }),
      ...(updates.targetWeightKg !== undefined && {
        target_weight_kg: updates.targetWeightKg,
      }),
      ...(updates.weeklyWeightChangeKg !== undefined && {
        weekly_weight_change_kg: updates.weeklyWeightChangeKg,
      }),
      ...(updates.maintenanceCalories !== undefined && {
        maintenance_calories: updates.maintenanceCalories,
      }),
      ...(updates.targetCalories !== undefined && {
        target_calories: updates.targetCalories,
      }),
      ...(updates.proteinTargetG !== undefined && {
        protein_target_g: updates.proteinTargetG,
      }),
      ...(updates.carbsTargetG !== undefined && {
        carbs_target_g: updates.carbsTargetG,
      }),
      ...(updates.fatTargetG !== undefined && {
        fat_target_g: updates.fatTargetG,
      }),
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}
