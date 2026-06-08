export type Sex = 'male' | 'female' | 'other'

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active'

export type GoalType = 'maintain' | 'mild_cut' | 'moderate_cut' | 'aggressive_cut'

export type UserProfile = {
  id: string
  name?: string
  age?: number
  sex?: Sex
  heightCm?: number
  weightKg?: number
  activityLevel?: ActivityLevel
  goalType?: GoalType
  calorieTarget?: number
  customCalorieTarget?: number
  maintenanceCalories?: number
  createdAt: string
  updatedAt: string
}
