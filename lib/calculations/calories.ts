import { ActivityLevel, Sex, GoalType } from '@/types/profile'
import { CalorieTarget } from '@/types/diet'

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return sex === 'male' ? base + 5 : base - 161
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_FACTORS[activityLevel])
}

export function getCalorieTargets(maintenanceCalories: number): CalorieTarget[] {
  return [
    {
      label: 'Maintain',
      key: 'maintain',
      calories: maintenanceCalories,
      deficit: 0,
      description: 'Stay at your current weight.',
    },
    {
      label: 'Mild cut',
      key: 'mild_cut',
      calories: maintenanceCalories - 250,
      deficit: 250,
      description: 'Slow, sustainable fat loss (~0.25 kg/week).',
    },
    {
      label: 'Moderate cut',
      key: 'moderate_cut',
      calories: maintenanceCalories - 500,
      deficit: 500,
      description: 'Steady fat loss (~0.5 kg/week).',
    },
    {
      label: 'Aggressive cut',
      key: 'aggressive_cut',
      calories: maintenanceCalories - 700,
      deficit: 700,
      description: 'Faster fat loss (~0.7 kg/week). Monitor energy levels.',
    },
  ]
}

export function getGoalTypeFromKey(key: GoalType): string {
  const map: Record<GoalType, string> = {
    maintain: 'Maintain',
    mild_cut: 'Mild cut',
    moderate_cut: 'Moderate cut',
    aggressive_cut: 'Aggressive cut',
  }
  return map[key]
}

export function getDailyCalories(meals: { calories: number }[]): number {
  return meals.reduce((sum, m) => sum + m.calories, 0)
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (desk job, little exercise)',
  light: 'Lightly active (1–3 days/week)',
  moderate: 'Moderately active (3–5 days/week)',
  active: 'Very active (6–7 days/week)',
  very_active: 'Extra active (physical job + training)',
}
