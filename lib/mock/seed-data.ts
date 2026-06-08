import { TrainingProgram, ExerciseLibraryItem, WorkoutDay, ProgramWeek } from '@/types/training'
import { SavedMeal, MealEntry } from '@/types/diet'
import { format, subDays } from 'date-fns'

// ─── Exercise Library ────────────────────────────────────────────────────────

export const SEED_EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  // Chest
  { id: 'ex-bench-press', name: 'Barbell Bench Press', muscleGroup: 'chest', category: 'upper', equipment: 'Barbell', movementPattern: 'Horizontal push' },
  { id: 'ex-incline-db', name: 'Incline Dumbbell Press', muscleGroup: 'chest', category: 'upper', equipment: 'Dumbbell', movementPattern: 'Incline push' },
  { id: 'ex-cable-fly', name: 'Cable Chest Fly', muscleGroup: 'chest', category: 'isolation', equipment: 'Cable', movementPattern: 'Fly' },
  { id: 'ex-dips', name: 'Weighted Dips', muscleGroup: 'chest', category: 'upper', equipment: 'Bodyweight', movementPattern: 'Vertical push' },
  // Shoulders
  { id: 'ex-ohp', name: 'Overhead Press', muscleGroup: 'shoulders', category: 'upper', equipment: 'Barbell', movementPattern: 'Vertical push' },
  { id: 'ex-lateral', name: 'Lateral Raises', muscleGroup: 'shoulders', category: 'isolation', equipment: 'Dumbbell', movementPattern: 'Isolation' },
  { id: 'ex-face-pulls', name: 'Face Pulls', muscleGroup: 'shoulders', category: 'isolation', equipment: 'Cable', movementPattern: 'Isolation' },
  // Triceps
  { id: 'ex-tri-pushdown', name: 'Tricep Pushdown', muscleGroup: 'triceps', category: 'isolation', equipment: 'Cable', movementPattern: 'Isolation' },
  { id: 'ex-skull-crushers', name: 'Skull Crushers', muscleGroup: 'triceps', category: 'isolation', equipment: 'Barbell', movementPattern: 'Isolation' },
  // Back
  { id: 'ex-deadlift', name: 'Deadlift', muscleGroup: 'back', category: 'lower', equipment: 'Barbell', movementPattern: 'Hip hinge' },
  { id: 'ex-pullups', name: 'Pull-ups', muscleGroup: 'back', category: 'upper', equipment: 'Bodyweight', movementPattern: 'Vertical pull' },
  { id: 'ex-lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'back', category: 'upper', equipment: 'Cable', movementPattern: 'Vertical pull' },
  { id: 'ex-cable-row', name: 'Seated Cable Row', muscleGroup: 'back', category: 'upper', equipment: 'Cable', movementPattern: 'Horizontal pull' },
  { id: 'ex-bb-row', name: 'Barbell Row', muscleGroup: 'back', category: 'upper', equipment: 'Barbell', movementPattern: 'Horizontal pull' },
  // Biceps
  { id: 'ex-curls', name: 'Barbell Curls', muscleGroup: 'biceps', category: 'isolation', equipment: 'Barbell', movementPattern: 'Isolation' },
  { id: 'ex-hammer-curls', name: 'Hammer Curls', muscleGroup: 'biceps', category: 'isolation', equipment: 'Dumbbell', movementPattern: 'Isolation' },
  // Legs
  { id: 'ex-squat', name: 'Barbell Squat', muscleGroup: 'quads', category: 'lower', equipment: 'Barbell', movementPattern: 'Squat' },
  { id: 'ex-leg-press', name: 'Leg Press', muscleGroup: 'quads', category: 'lower', equipment: 'Machine', movementPattern: 'Squat' },
  { id: 'ex-rdl', name: 'Romanian Deadlift', muscleGroup: 'hamstrings', category: 'lower', equipment: 'Barbell', movementPattern: 'Hip hinge' },
  { id: 'ex-leg-curl', name: 'Leg Curl', muscleGroup: 'hamstrings', category: 'isolation', equipment: 'Machine', movementPattern: 'Isolation' },
  { id: 'ex-calf-raises', name: 'Standing Calf Raises', muscleGroup: 'calves', category: 'isolation', equipment: 'Machine', movementPattern: 'Isolation' },
  { id: 'ex-lunges', name: 'Dumbbell Lunges', muscleGroup: 'quads', category: 'lower', equipment: 'Dumbbell', movementPattern: 'Lunge' },
]

// ─── Training Program: PPL 6-Day ─────────────────────────────────────────────

const WEEK_ID = 'week-1'

const PUSH_A: WorkoutDay = {
  id: 'day-push-a',
  name: 'Push A',
  dayIndex: 0, // Monday
  exercises: [
    { id: 'pe-1', exerciseId: 'ex-bench-press', order: 0, plannedSets: 4, repRangeMin: 6, repRangeMax: 8, restSeconds: 180, progressionType: 'double_progression' },
    { id: 'pe-2', exerciseId: 'ex-ohp', order: 1, plannedSets: 3, repRangeMin: 8, repRangeMax: 10, restSeconds: 120, progressionType: 'double_progression' },
    { id: 'pe-3', exerciseId: 'ex-incline-db', order: 2, plannedSets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 90 },
    { id: 'pe-4', exerciseId: 'ex-lateral', order: 3, plannedSets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 60 },
    { id: 'pe-5', exerciseId: 'ex-tri-pushdown', order: 4, plannedSets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 60 },
  ],
}

const PULL_A: WorkoutDay = {
  id: 'day-pull-a',
  name: 'Pull A',
  dayIndex: 1, // Tuesday
  exercises: [
    { id: 'pe-6', exerciseId: 'ex-deadlift', order: 0, plannedSets: 3, repRangeMin: 4, repRangeMax: 6, restSeconds: 240, progressionType: 'double_progression' },
    { id: 'pe-7', exerciseId: 'ex-pullups', order: 1, plannedSets: 4, repRangeMin: 6, repRangeMax: 10, restSeconds: 120 },
    { id: 'pe-8', exerciseId: 'ex-cable-row', order: 2, plannedSets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 90 },
    { id: 'pe-9', exerciseId: 'ex-face-pulls', order: 3, plannedSets: 3, repRangeMin: 15, repRangeMax: 20, restSeconds: 60 },
    { id: 'pe-10', exerciseId: 'ex-curls', order: 4, plannedSets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 60 },
  ],
}

const LEGS_A: WorkoutDay = {
  id: 'day-legs-a',
  name: 'Legs A',
  dayIndex: 2, // Wednesday
  exercises: [
    { id: 'pe-11', exerciseId: 'ex-squat', order: 0, plannedSets: 4, repRangeMin: 6, repRangeMax: 8, restSeconds: 180, progressionType: 'double_progression' },
    { id: 'pe-12', exerciseId: 'ex-leg-press', order: 1, plannedSets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 120 },
    { id: 'pe-13', exerciseId: 'ex-rdl', order: 2, plannedSets: 3, repRangeMin: 8, repRangeMax: 10, restSeconds: 120 },
    { id: 'pe-14', exerciseId: 'ex-leg-curl', order: 3, plannedSets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 90 },
    { id: 'pe-15', exerciseId: 'ex-calf-raises', order: 4, plannedSets: 4, repRangeMin: 12, repRangeMax: 15, restSeconds: 60 },
  ],
}

const PUSH_B: WorkoutDay = {
  id: 'day-push-b',
  name: 'Push B',
  dayIndex: 3, // Thursday
  exercises: [
    { id: 'pe-16', exerciseId: 'ex-dips', order: 0, plannedSets: 4, repRangeMin: 8, repRangeMax: 10, restSeconds: 120, progressionType: 'double_progression' },
    { id: 'pe-17', exerciseId: 'ex-incline-db', order: 1, plannedSets: 4, repRangeMin: 8, repRangeMax: 10, restSeconds: 120 },
    { id: 'pe-18', exerciseId: 'ex-cable-fly', order: 2, plannedSets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 60 },
    { id: 'pe-19', exerciseId: 'ex-lateral', order: 3, plannedSets: 4, repRangeMin: 15, repRangeMax: 20, restSeconds: 45 },
    { id: 'pe-20', exerciseId: 'ex-skull-crushers', order: 4, plannedSets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 60 },
  ],
}

const PULL_B: WorkoutDay = {
  id: 'day-pull-b',
  name: 'Pull B',
  dayIndex: 4, // Friday
  exercises: [
    { id: 'pe-21', exerciseId: 'ex-lat-pulldown', order: 0, plannedSets: 4, repRangeMin: 8, repRangeMax: 10, restSeconds: 120, progressionType: 'double_progression' },
    { id: 'pe-22', exerciseId: 'ex-bb-row', order: 1, plannedSets: 4, repRangeMin: 8, repRangeMax: 10, restSeconds: 120 },
    { id: 'pe-23', exerciseId: 'ex-face-pulls', order: 2, plannedSets: 3, repRangeMin: 15, repRangeMax: 20, restSeconds: 60 },
    { id: 'pe-24', exerciseId: 'ex-hammer-curls', order: 3, plannedSets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 60 },
  ],
}

const LEGS_B: WorkoutDay = {
  id: 'day-legs-b',
  name: 'Legs B',
  dayIndex: 5, // Saturday
  exercises: [
    { id: 'pe-25', exerciseId: 'ex-squat', order: 0, plannedSets: 3, repRangeMin: 8, repRangeMax: 10, restSeconds: 180 },
    { id: 'pe-26', exerciseId: 'ex-lunges', order: 1, plannedSets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 90 },
    { id: 'pe-27', exerciseId: 'ex-rdl', order: 2, plannedSets: 4, repRangeMin: 10, repRangeMax: 12, restSeconds: 120 },
    { id: 'pe-28', exerciseId: 'ex-calf-raises', order: 3, plannedSets: 4, repRangeMin: 15, repRangeMax: 20, restSeconds: 45 },
  ],
}

const PROGRAM_WEEK: ProgramWeek = {
  id: WEEK_ID,
  weekNumber: 1,
  workoutDays: [PUSH_A, PULL_A, LEGS_A, PUSH_B, PULL_B, LEGS_B],
}

export const SEED_PROGRAMS: TrainingProgram[] = [
  {
    id: 'prog-ppl',
    name: 'Push Pull Legs',
    description: '6-day PPL split for hypertrophy and strength.',
    startDate: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
    weeks: [PROGRAM_WEEK],
    createdAt: subDays(new Date(), 14).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// ─── Saved Meals ─────────────────────────────────────────────────────────────

export const SEED_SAVED_MEALS: SavedMeal[] = [
  {
    id: 'meal-chicken-rice',
    name: 'Chicken & Rice',
    defaultCalories: 560,
    protein: 48,
    carbs: 64,
    fats: 8,
    serving: '1 bowl (350g)',
    mealType: 'lunch',
    tags: ['high-protein', 'meal-prep'],
    useCount: 18,
    lastUsedAt: subDays(new Date(), 1).toISOString(),
    createdAt: subDays(new Date(), 30).toISOString(),
  },
  {
    id: 'meal-greek-yogurt',
    name: 'Greek Yogurt & Berries',
    defaultCalories: 280,
    protein: 22,
    carbs: 32,
    fats: 4,
    serving: '1 cup + 80g berries',
    mealType: 'breakfast',
    tags: ['high-protein', 'quick'],
    useCount: 14,
    lastUsedAt: subDays(new Date(), 2).toISOString(),
    createdAt: subDays(new Date(), 30).toISOString(),
  },
  {
    id: 'meal-oatmeal',
    name: 'Oatmeal with Banana',
    defaultCalories: 380,
    protein: 12,
    carbs: 68,
    fats: 6,
    serving: '80g oats + 1 medium banana',
    mealType: 'breakfast',
    tags: ['meal-prep'],
    useCount: 11,
    lastUsedAt: subDays(new Date(), 3).toISOString(),
    createdAt: subDays(new Date(), 30).toISOString(),
  },
  {
    id: 'meal-salmon-veg',
    name: 'Salmon & Vegetables',
    defaultCalories: 520,
    protein: 42,
    carbs: 20,
    fats: 28,
    serving: '180g salmon + 200g mixed veg',
    mealType: 'dinner',
    tags: ['high-protein'],
    useCount: 9,
    lastUsedAt: subDays(new Date(), 2).toISOString(),
    createdAt: subDays(new Date(), 30).toISOString(),
  },
  {
    id: 'meal-protein-shake',
    name: 'Protein Shake',
    defaultCalories: 200,
    protein: 28,
    carbs: 14,
    fats: 3,
    serving: '1 scoop + 300ml milk',
    mealType: 'snack',
    tags: ['high-protein', 'quick', 'post-workout'],
    useCount: 22,
    lastUsedAt: subDays(new Date(), 1).toISOString(),
    createdAt: subDays(new Date(), 30).toISOString(),
  },
  {
    id: 'meal-eggs-toast',
    name: 'Scrambled Eggs & Toast',
    defaultCalories: 420,
    protein: 26,
    carbs: 38,
    fats: 16,
    serving: '3 eggs + 2 slices sourdough',
    mealType: 'breakfast',
    tags: ['high-protein', 'quick'],
    useCount: 8,
    lastUsedAt: subDays(new Date(), 5).toISOString(),
    createdAt: subDays(new Date(), 30).toISOString(),
  },
  {
    id: 'meal-turkey-sandwich',
    name: 'Turkey Sandwich',
    defaultCalories: 450,
    protein: 34,
    carbs: 48,
    fats: 12,
    serving: '2 slices + 120g turkey',
    mealType: 'lunch',
    tags: ['high-protein', 'quick'],
    useCount: 6,
    lastUsedAt: subDays(new Date(), 4).toISOString(),
    createdAt: subDays(new Date(), 30).toISOString(),
  },
  {
    id: 'meal-mixed-nuts',
    name: 'Mixed Nuts',
    defaultCalories: 180,
    protein: 5,
    carbs: 6,
    fats: 16,
    serving: '30g',
    mealType: 'snack',
    tags: ['quick'],
    useCount: 10,
    lastUsedAt: subDays(new Date(), 1).toISOString(),
    createdAt: subDays(new Date(), 30).toISOString(),
  },
  {
    id: 'meal-beef-rice',
    name: 'Ground Beef & Rice',
    defaultCalories: 620,
    protein: 52,
    carbs: 60,
    fats: 16,
    serving: '150g beef + 200g cooked rice',
    mealType: 'dinner',
    tags: ['high-protein', 'meal-prep'],
    useCount: 7,
    lastUsedAt: subDays(new Date(), 3).toISOString(),
    createdAt: subDays(new Date(), 30).toISOString(),
  },
  {
    id: 'meal-cottage-cheese',
    name: 'Cottage Cheese',
    defaultCalories: 150,
    protein: 20,
    carbs: 8,
    fats: 3,
    serving: '200g',
    mealType: 'snack',
    tags: ['high-protein', 'quick'],
    useCount: 5,
    createdAt: subDays(new Date(), 20).toISOString(),
  },
]

// ─── Sample Meal Entries (last 7 days) ──────────────────────────────────────

function makeMealEntries(): MealEntry[] {
  const entries: MealEntry[] = []
  const target = 2200

  const dayPlans: { mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'; mealId: string; calVariance: number }[][] = [
    // Day -6
    [
      { mealType: 'breakfast', mealId: 'meal-oatmeal', calVariance: 0 },
      { mealType: 'lunch', mealId: 'meal-chicken-rice', calVariance: 0 },
      { mealType: 'snack', mealId: 'meal-protein-shake', calVariance: 0 },
      { mealType: 'dinner', mealId: 'meal-salmon-veg', calVariance: 0 },
      { mealType: 'snack', mealId: 'meal-mixed-nuts', calVariance: 0 },
    ],
    // Day -5
    [
      { mealType: 'breakfast', mealId: 'meal-eggs-toast', calVariance: 0 },
      { mealType: 'lunch', mealId: 'meal-turkey-sandwich', calVariance: 0 },
      { mealType: 'snack', mealId: 'meal-protein-shake', calVariance: 0 },
      { mealType: 'dinner', mealId: 'meal-beef-rice', calVariance: 0 },
    ],
    // Day -4
    [
      { mealType: 'breakfast', mealId: 'meal-greek-yogurt', calVariance: 0 },
      { mealType: 'lunch', mealId: 'meal-chicken-rice', calVariance: 0 },
      { mealType: 'snack', mealId: 'meal-cottage-cheese', calVariance: 0 },
      { mealType: 'dinner', mealId: 'meal-salmon-veg', calVariance: 0 },
      { mealType: 'snack', mealId: 'meal-mixed-nuts', calVariance: 0 },
    ],
    // Day -3
    [
      { mealType: 'breakfast', mealId: 'meal-oatmeal', calVariance: 0 },
      { mealType: 'lunch', mealId: 'meal-beef-rice', calVariance: 0 },
      { mealType: 'snack', mealId: 'meal-protein-shake', calVariance: 0 },
      { mealType: 'dinner', mealId: 'meal-chicken-rice', calVariance: 0 },
    ],
    // Day -2
    [
      { mealType: 'breakfast', mealId: 'meal-eggs-toast', calVariance: 0 },
      { mealType: 'lunch', mealId: 'meal-turkey-sandwich', calVariance: 0 },
      { mealType: 'snack', mealId: 'meal-mixed-nuts', calVariance: 0 },
      { mealType: 'snack', mealId: 'meal-protein-shake', calVariance: 0 },
      { mealType: 'dinner', mealId: 'meal-beef-rice', calVariance: 0 },
    ],
    // Day -1
    [
      { mealType: 'breakfast', mealId: 'meal-greek-yogurt', calVariance: 0 },
      { mealType: 'lunch', mealId: 'meal-chicken-rice', calVariance: 0 },
      { mealType: 'snack', mealId: 'meal-protein-shake', calVariance: 0 },
      { mealType: 'dinner', mealId: 'meal-salmon-veg', calVariance: 0 },
    ],
  ]

  const mealMap = Object.fromEntries(SEED_SAVED_MEALS.map((m) => [m.id, m]))

  dayPlans.forEach((plan, dayOffset) => {
    const date = format(subDays(new Date(), 6 - dayOffset), 'yyyy-MM-dd')
    plan.forEach((item, i) => {
      const saved = mealMap[item.mealId]
      if (!saved) return
      entries.push({
        id: `entry-${dayOffset}-${i}`,
        date,
        mealType: item.mealType,
        savedMealId: item.mealId,
        name: saved.name,
        calories: saved.defaultCalories,
        protein: saved.protein,
        carbs: saved.carbs,
        fats: saved.fats,
        serving: saved.serving,
        tags: saved.tags,
        createdAt: new Date(date + 'T08:00:00').toISOString(),
      })
    })
  })

  return entries
}

export const SEED_MEAL_ENTRIES: MealEntry[] = makeMealEntries()
