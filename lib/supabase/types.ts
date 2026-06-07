// Supabase database types.
// Replace with generated types once schema is deployed:
//   npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_REF" --schema public > lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          user_id: string
          unit_system: 'metric' | 'imperial'
          timezone: string
          week_starts_on: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          unit_system?: 'metric' | 'imperial'
          timezone?: string
          week_starts_on?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          unit_system?: 'metric' | 'imperial'
          timezone?: string
          week_starts_on?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      nutrition_profiles: {
        Row: {
          user_id: string
          goal: 'maintain' | 'lose' | 'gain'
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
          sex: string | null
          birth_year: number | null
          height_cm: number | null
          current_weight_kg: number | null
          target_weight_kg: number | null
          weekly_weight_change_kg: number | null
          maintenance_calories: number | null
          target_calories: number | null
          protein_target_g: number | null
          carbs_target_g: number | null
          fat_target_g: number | null
          fiber_target_g: number | null
          algorithm_version: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          goal?: 'maintain' | 'lose' | 'gain'
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
          sex?: string | null
          birth_year?: number | null
          height_cm?: number | null
          current_weight_kg?: number | null
          target_weight_kg?: number | null
          weekly_weight_change_kg?: number | null
          maintenance_calories?: number | null
          target_calories?: number | null
          protein_target_g?: number | null
          carbs_target_g?: number | null
          fat_target_g?: number | null
          fiber_target_g?: number | null
          algorithm_version?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          goal?: 'maintain' | 'lose' | 'gain'
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
          sex?: string | null
          birth_year?: number | null
          height_cm?: number | null
          current_weight_kg?: number | null
          target_weight_kg?: number | null
          weekly_weight_change_kg?: number | null
          maintenance_calories?: number | null
          target_calories?: number | null
          protein_target_g?: number | null
          carbs_target_g?: number | null
          fat_target_g?: number | null
          fiber_target_g?: number | null
          algorithm_version?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      calorie_target_history: {
        Row: {
          id: string
          user_id: string
          effective_from: string
          maintenance_calories: number
          target_calories: number
          deficit_calories: number | null
          protein_target_g: number | null
          carbs_target_g: number | null
          fat_target_g: number | null
          fiber_target_g: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          effective_from: string
          maintenance_calories: number
          target_calories: number
          deficit_calories?: number | null
          protein_target_g?: number | null
          carbs_target_g?: number | null
          fat_target_g?: number | null
          fiber_target_g?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          effective_from?: string
          maintenance_calories?: number
          target_calories?: number
          deficit_calories?: number | null
          protein_target_g?: number | null
          carbs_target_g?: number | null
          fat_target_g?: number | null
          fiber_target_g?: number | null
          created_at?: string
        }
        Relationships: []
      }
      foods: {
        Row: {
          id: string
          user_id: string
          name: string
          brand: string | null
          serving_amount: number
          serving_unit: string
          calories: number
          protein_g: number
          carbs_g: number
          fat_g: number
          fiber_g: number
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          brand?: string | null
          serving_amount?: number
          serving_unit: string
          calories: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          fiber_g?: number
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          brand?: string | null
          serving_amount?: number
          serving_unit?: string
          calories?: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          fiber_g?: number
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      meal_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          meal_slot: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
          default_calories: number
          default_protein_g: number | null
          default_carbs_g: number | null
          default_fat_g: number | null
          use_count: number
          last_used_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          meal_slot?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
          default_calories?: number
          default_protein_g?: number | null
          default_carbs_g?: number | null
          default_fat_g?: number | null
          use_count?: number
          last_used_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          meal_slot?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
          default_calories?: number
          default_protein_g?: number | null
          default_carbs_g?: number | null
          default_fat_g?: number | null
          use_count?: number
          last_used_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      food_log_entries: {
        Row: {
          id: string
          user_id: string
          logged_for_date: string
          meal_slot: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          consumed_at: string | null
          food_id: string | null
          source: string
          item_name: string
          quantity: number
          serving_amount: number | null
          serving_unit: string | null
          calories: number
          protein_g: number
          carbs_g: number
          fat_g: number
          fiber_g: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          logged_for_date: string
          meal_slot: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          consumed_at?: string | null
          food_id?: string | null
          source?: string
          item_name: string
          quantity?: number
          serving_amount?: number | null
          serving_unit?: string | null
          calories: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          fiber_g?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          logged_for_date?: string
          meal_slot?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          consumed_at?: string | null
          food_id?: string | null
          source?: string
          item_name?: string
          quantity?: number
          serving_amount?: number | null
          serving_unit?: string | null
          calories?: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          fiber_g?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      body_metrics: {
        Row: {
          id: string
          user_id: string
          recorded_on: string
          body_weight_kg: number | null
          waist_cm: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recorded_on: string
          body_weight_kg?: number | null
          waist_cm?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recorded_on?: string
          body_weight_kg?: number | null
          waist_cm?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      exercise_catalog: {
        Row: {
          id: string
          slug: string
          name: string
          primary_muscle_group: string | null
          secondary_muscle_groups: string[]
          equipment: string[]
          is_bodyweight: boolean
          default_increment_kg: number | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          primary_muscle_group?: string | null
          secondary_muscle_groups?: string[]
          equipment?: string[]
          is_bodyweight?: boolean
          default_increment_kg?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          primary_muscle_group?: string | null
          secondary_muscle_groups?: string[]
          equipment?: string[]
          is_bodyweight?: boolean
          default_increment_kg?: number | null
          created_at?: string
        }
        Relationships: []
      }
      training_programs: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_active: boolean
          started_on: string | null
          ended_on: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_active?: boolean
          started_on?: string | null
          ended_on?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          started_on?: string | null
          ended_on?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_program_days: {
        Row: {
          id: string
          program_id: string
          day_index: number
          label: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          program_id: string
          day_index: number
          label: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          day_index?: number
          label?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      training_program_exercises: {
        Row: {
          id: string
          program_day_id: string
          exercise_id: string | null
          exercise_name_snapshot: string
          order_index: number
          prescribed_sets: number
          rep_min: number | null
          rep_max: number | null
          target_rpe: number | null
          rest_seconds: number | null
          progression_mode: 'double_progression' | 'fixed_increment' | 'manual'
          progression_increment_kg: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          program_day_id: string
          exercise_id?: string | null
          exercise_name_snapshot: string
          order_index: number
          prescribed_sets: number
          rep_min?: number | null
          rep_max?: number | null
          target_rpe?: number | null
          rest_seconds?: number | null
          progression_mode?: 'double_progression' | 'fixed_increment' | 'manual'
          progression_increment_kg?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          program_day_id?: string
          exercise_id?: string | null
          exercise_name_snapshot?: string
          order_index?: number
          prescribed_sets?: number
          rep_min?: number | null
          rep_max?: number | null
          target_rpe?: number | null
          rest_seconds?: number | null
          progression_mode?: 'double_progression' | 'fixed_increment' | 'manual'
          progression_increment_kg?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          program_id: string | null
          program_day_id: string | null
          performed_on: string
          started_at: string | null
          completed_at: string | null
          duration_minutes: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          program_id?: string | null
          program_day_id?: string | null
          performed_on: string
          started_at?: string | null
          completed_at?: string | null
          duration_minutes?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          program_id?: string | null
          program_day_id?: string | null
          performed_on?: string
          started_at?: string | null
          completed_at?: string | null
          duration_minutes?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      workout_exercise_logs: {
        Row: {
          id: string
          workout_session_id: string
          training_program_exercise_id: string | null
          exercise_id: string | null
          exercise_name_snapshot: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          workout_session_id: string
          training_program_exercise_id?: string | null
          exercise_id?: string | null
          exercise_name_snapshot: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          workout_session_id?: string
          training_program_exercise_id?: string | null
          exercise_id?: string | null
          exercise_name_snapshot?: string
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      workout_set_logs: {
        Row: {
          id: string
          workout_exercise_log_id: string
          set_number: number
          reps: number | null
          weight_kg: number | null
          rpe: number | null
          is_warmup: boolean
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workout_exercise_log_id: string
          set_number: number
          reps?: number | null
          weight_kg?: number | null
          rpe?: number | null
          is_warmup?: boolean
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workout_exercise_log_id?: string
          set_number?: number
          reps?: number | null
          weight_kg?: number | null
          rpe?: number | null
          is_warmup?: boolean
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      progression_recommendations: {
        Row: {
          id: string
          user_id: string
          training_program_exercise_id: string | null
          workout_exercise_log_id: string | null
          recommended_weight_kg: number | null
          recommended_rep_min: number | null
          recommended_rep_max: number | null
          rationale: string | null
          rule_version: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          training_program_exercise_id?: string | null
          workout_exercise_log_id?: string | null
          recommended_weight_kg?: number | null
          recommended_rep_min?: number | null
          recommended_rep_max?: number | null
          rationale?: string | null
          rule_version?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          training_program_exercise_id?: string | null
          workout_exercise_log_id?: string | null
          recommended_weight_kg?: number | null
          recommended_rep_min?: number | null
          recommended_rep_max?: number | null
          rationale?: string | null
          rule_version?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      daily_nutrition_summary: {
        Row: {
          user_id: string | null
          logged_for_date: string | null
          total_calories: number | null
          total_protein_g: number | null
          total_carbs_g: number | null
          total_fat_g: number | null
          total_fiber_g: number | null
          entry_count: number | null
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: {
      unit_system: 'metric' | 'imperial'
      meal_slot: 'breakfast' | 'lunch' | 'dinner' | 'snack'
      goal_type: 'maintain' | 'lose' | 'gain'
      activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
      progression_mode: 'double_progression' | 'fixed_increment' | 'manual'
    }
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
