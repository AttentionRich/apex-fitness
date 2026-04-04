export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type MealTag =
  | 'high-protein'
  | 'low-calorie'
  | 'quick'
  | 'pre-workout'
  | 'post-workout'
  | 'vegetarian'
  | 'vegan'
  | 'meal-prep'

export type SavedMeal = {
  id: string
  name: string
  defaultCalories: number
  protein?: number
  carbs?: number
  fats?: number
  serving?: string
  mealType?: MealType
  tags?: MealTag[]
  useCount: number
  lastUsedAt?: string
  createdAt: string
}

export type MealEntry = {
  id: string
  date: string // 'YYYY-MM-DD'
  mealType: MealType
  savedMealId?: string // reference to SavedMeal if from library
  name: string
  calories: number
  protein?: number
  carbs?: number
  fats?: number
  serving?: string
  tags?: MealTag[]
  createdAt: string
}

export type DailyNutritionSummary = {
  date: string
  targetCalories: number
  consumedCalories: number
  remainingCalories: number
  meals: MealEntry[]
  adherent: boolean // within 100 kcal of target
}

export type CalorieTarget = {
  label: string
  key: 'maintain' | 'mild_cut' | 'moderate_cut' | 'aggressive_cut'
  calories: number
  deficit: number
  description: string
}

export type CalorieTrendPoint = {
  date: string
  consumed: number
  target: number
  adherent: boolean
}
