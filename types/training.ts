export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'full_body'
  | 'other'

export type ExerciseCategory = 'upper' | 'lower' | 'isolation' | 'other'

export type ProgressionType = 'double_progression' | 'fixed_jump' | 'manual'

export type ExerciseLibraryItem = {
  id: string
  name: string
  muscleGroup: MuscleGroup
  category: ExerciseCategory
  equipment?: string
  movementPattern?: string
  isCustom?: boolean
}

export type PlannedExercise = {
  id: string
  exerciseId: string
  order: number
  plannedSets: number
  repRangeMin: number
  repRangeMax: number
  restSeconds?: number
  notes?: string
  progressionType?: ProgressionType
}

export type WorkoutDay = {
  id: string
  name: string
  dayIndex: number // 0 = Monday, 6 = Sunday
  exercises: PlannedExercise[]
}

export type ProgramWeek = {
  id: string
  weekNumber: number
  workoutDays: WorkoutDay[]
}

export type TrainingProgram = {
  id: string
  name: string
  description?: string
  startDate: string
  weeks: ProgramWeek[]
  createdAt: string
  updatedAt: string
}

export type LoggedSet = {
  id: string
  setNumber: number
  weight: number
  reps: number
  completed: boolean
}

export type ExerciseLog = {
  id: string
  plannedExerciseId: string
  exerciseId: string
  sets: LoggedSet[]
  notes?: string
}

export type WorkoutLog = {
  id: string
  date: string // ISO date string 'YYYY-MM-DD'
  programId: string
  workoutDayId: string
  workoutDayName: string
  completed: boolean
  exerciseLogs: ExerciseLog[]
  durationMinutes?: number
  createdAt: string
  updatedAt: string
}

export type ProgressionSuggestion = {
  exerciseId: string
  exerciseName: string
  currentWeight: number
  suggestedWeight: number
  status: 'increase' | 'maintain' | 'reduce'
  reason: string
  increment: number
}

export type VolumeDataPoint = {
  date: string
  volume: number // total weight × reps
  sets: number
}

export type ExerciseHistory = {
  exerciseId: string
  entries: {
    date: string
    workoutLogId: string
    sets: LoggedSet[]
    bestSet: LoggedSet
    totalVolume: number
  }[]
}
