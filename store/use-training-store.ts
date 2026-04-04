'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  TrainingProgram,
  WorkoutLog,
  ExerciseLibraryItem,
  WorkoutDay,
  PlannedExercise,
  ExerciseLog,
  LoggedSet,
} from '@/types/training'
import { SEED_PROGRAMS, SEED_EXERCISE_LIBRARY } from '@/lib/mock/seed-data'
import { format } from 'date-fns'

type TrainingStore = {
  programs: TrainingProgram[]
  activeProgramId: string | null
  workoutLogs: WorkoutLog[]
  exerciseLibrary: ExerciseLibraryItem[]
  isSeeded: boolean

  // Program actions
  setActiveProgramId: (id: string | null) => void
  addProgram: (program: TrainingProgram) => void
  updateProgram: (program: TrainingProgram) => void
  deleteProgram: (id: string) => void

  // Workout day actions
  addWorkoutDay: (programId: string, weekId: string, day: WorkoutDay) => void
  updateWorkoutDay: (programId: string, weekId: string, day: WorkoutDay) => void
  deleteWorkoutDay: (programId: string, weekId: string, dayId: string) => void

  // Exercise plan actions
  addExerciseToPlan: (programId: string, weekId: string, dayId: string, exercise: PlannedExercise) => void
  updateExerciseInPlan: (programId: string, weekId: string, dayId: string, exercise: PlannedExercise) => void
  removeExerciseFromPlan: (programId: string, weekId: string, dayId: string, exerciseId: string) => void
  reorderExercises: (programId: string, weekId: string, dayId: string, exercises: PlannedExercise[]) => void

  // Workout log actions
  addWorkoutLog: (log: WorkoutLog) => void
  updateWorkoutLog: (log: WorkoutLog) => void
  deleteWorkoutLog: (id: string) => void
  updateExerciseLog: (logId: string, exerciseLog: ExerciseLog) => void
  updateLoggedSet: (logId: string, exerciseLogId: string, set: LoggedSet) => void
  completeWorkout: (logId: string, durationMinutes?: number) => void

  // Exercise library actions
  addExercise: (exercise: ExerciseLibraryItem) => void
  updateExercise: (exercise: ExerciseLibraryItem) => void
  deleteExercise: (id: string) => void

  // Seed
  seedData: () => void

  // Selectors (computed helpers)
  getActiveProgram: () => TrainingProgram | null
  getTodayWorkoutDay: () => WorkoutDay | null
  getWorkoutLogForDay: (dayId: string, date: string) => WorkoutLog | undefined
  getExerciseById: (id: string) => ExerciseLibraryItem | undefined
  getExerciseHistory: (exerciseId: string) => WorkoutLog[]
  getWeeklyLogs: (weekStart: string) => WorkoutLog[]
  getLogByDate: (date: string) => WorkoutLog[]
}

export const useTrainingStore = create<TrainingStore>()(
  persist(
    (set, get) => ({
      programs: [],
      activeProgramId: null,
      workoutLogs: [],
      exerciseLibrary: [],
      isSeeded: false,

      setActiveProgramId: (id) => set({ activeProgramId: id }),

      addProgram: (program) =>
        set((state) => ({ programs: [...state.programs, program] })),

      updateProgram: (program) =>
        set((state) => ({
          programs: state.programs.map((p) => (p.id === program.id ? program : p)),
        })),

      deleteProgram: (id) =>
        set((state) => ({
          programs: state.programs.filter((p) => p.id !== id),
          activeProgramId: state.activeProgramId === id ? null : state.activeProgramId,
        })),

      addWorkoutDay: (programId, weekId, day) =>
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === programId
              ? {
                  ...p,
                  weeks: p.weeks.map((w) =>
                    w.id === weekId
                      ? { ...w, workoutDays: [...w.workoutDays, day] }
                      : w
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        })),

      updateWorkoutDay: (programId, weekId, day) =>
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === programId
              ? {
                  ...p,
                  weeks: p.weeks.map((w) =>
                    w.id === weekId
                      ? {
                          ...w,
                          workoutDays: w.workoutDays.map((d) =>
                            d.id === day.id ? day : d
                          ),
                        }
                      : w
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        })),

      deleteWorkoutDay: (programId, weekId, dayId) =>
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === programId
              ? {
                  ...p,
                  weeks: p.weeks.map((w) =>
                    w.id === weekId
                      ? {
                          ...w,
                          workoutDays: w.workoutDays.filter((d) => d.id !== dayId),
                        }
                      : w
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        })),

      addExerciseToPlan: (programId, weekId, dayId, exercise) =>
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === programId
              ? {
                  ...p,
                  weeks: p.weeks.map((w) =>
                    w.id === weekId
                      ? {
                          ...w,
                          workoutDays: w.workoutDays.map((d) =>
                            d.id === dayId
                              ? { ...d, exercises: [...d.exercises, exercise] }
                              : d
                          ),
                        }
                      : w
                  ),
                }
              : p
          ),
        })),

      updateExerciseInPlan: (programId, weekId, dayId, exercise) =>
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === programId
              ? {
                  ...p,
                  weeks: p.weeks.map((w) =>
                    w.id === weekId
                      ? {
                          ...w,
                          workoutDays: w.workoutDays.map((d) =>
                            d.id === dayId
                              ? {
                                  ...d,
                                  exercises: d.exercises.map((e) =>
                                    e.id === exercise.id ? exercise : e
                                  ),
                                }
                              : d
                          ),
                        }
                      : w
                  ),
                }
              : p
          ),
        })),

      removeExerciseFromPlan: (programId, weekId, dayId, exerciseId) =>
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === programId
              ? {
                  ...p,
                  weeks: p.weeks.map((w) =>
                    w.id === weekId
                      ? {
                          ...w,
                          workoutDays: w.workoutDays.map((d) =>
                            d.id === dayId
                              ? {
                                  ...d,
                                  exercises: d.exercises.filter(
                                    (e) => e.id !== exerciseId
                                  ),
                                }
                              : d
                          ),
                        }
                      : w
                  ),
                }
              : p
          ),
        })),

      reorderExercises: (programId, weekId, dayId, exercises) =>
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === programId
              ? {
                  ...p,
                  weeks: p.weeks.map((w) =>
                    w.id === weekId
                      ? {
                          ...w,
                          workoutDays: w.workoutDays.map((d) =>
                            d.id === dayId ? { ...d, exercises } : d
                          ),
                        }
                      : w
                  ),
                }
              : p
          ),
        })),

      addWorkoutLog: (log) =>
        set((state) => ({ workoutLogs: [...state.workoutLogs, log] })),

      updateWorkoutLog: (log) =>
        set((state) => ({
          workoutLogs: state.workoutLogs.map((l) => (l.id === log.id ? log : l)),
        })),

      deleteWorkoutLog: (id) =>
        set((state) => ({
          workoutLogs: state.workoutLogs.filter((l) => l.id !== id),
        })),

      updateExerciseLog: (logId, exerciseLog) =>
        set((state) => ({
          workoutLogs: state.workoutLogs.map((l) =>
            l.id === logId
              ? {
                  ...l,
                  exerciseLogs: l.exerciseLogs.map((e) =>
                    e.id === exerciseLog.id ? exerciseLog : e
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : l
          ),
        })),

      updateLoggedSet: (logId, exerciseLogId, updatedSet) =>
        set((state) => ({
          workoutLogs: state.workoutLogs.map((l) =>
            l.id === logId
              ? {
                  ...l,
                  exerciseLogs: l.exerciseLogs.map((e) =>
                    e.id === exerciseLogId
                      ? {
                          ...e,
                          sets: e.sets.map((s) =>
                            s.id === updatedSet.id ? updatedSet : s
                          ),
                        }
                      : e
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : l
          ),
        })),

      completeWorkout: (logId, durationMinutes) =>
        set((state) => ({
          workoutLogs: state.workoutLogs.map((l) =>
            l.id === logId
              ? {
                  ...l,
                  completed: true,
                  durationMinutes,
                  updatedAt: new Date().toISOString(),
                }
              : l
          ),
        })),

      addExercise: (exercise) =>
        set((state) => ({
          exerciseLibrary: [...state.exerciseLibrary, exercise],
        })),

      updateExercise: (exercise) =>
        set((state) => ({
          exerciseLibrary: state.exerciseLibrary.map((e) =>
            e.id === exercise.id ? exercise : e
          ),
        })),

      deleteExercise: (id) =>
        set((state) => ({
          exerciseLibrary: state.exerciseLibrary.filter((e) => e.id !== id),
        })),

      seedData: () => {
        if (get().isSeeded) return
        set({
          programs: SEED_PROGRAMS,
          activeProgramId: SEED_PROGRAMS[0]?.id ?? null,
          exerciseLibrary: SEED_EXERCISE_LIBRARY,
          workoutLogs: [],
          isSeeded: true,
        })
      },

      // Selectors
      getActiveProgram: () => {
        const { programs, activeProgramId } = get()
        return programs.find((p) => p.id === activeProgramId) ?? null
      },

      getTodayWorkoutDay: () => {
        const program = get().getActiveProgram()
        if (!program || !program.weeks.length) return null
        // 0=Mon, 1=Tue, ... 6=Sun (JS: 0=Sun, so we shift)
        const jsDay = new Date().getDay()
        const dayIndex = jsDay === 0 ? 6 : jsDay - 1
        const week = program.weeks[0]
        return week.workoutDays.find((d) => d.dayIndex === dayIndex) ?? null
      },

      getWorkoutLogForDay: (dayId, date) => {
        return get().workoutLogs.find(
          (l) => l.workoutDayId === dayId && l.date === date
        )
      },

      getExerciseById: (id) => {
        return get().exerciseLibrary.find((e) => e.id === id)
      },

      getExerciseHistory: (exerciseId) => {
        return get()
          .workoutLogs.filter((log) =>
            log.exerciseLogs.some((el) => el.exerciseId === exerciseId)
          )
          .sort((a, b) => a.date.localeCompare(b.date))
      },

      getWeeklyLogs: (weekStart) => {
        const start = new Date(weekStart)
        const end = new Date(start)
        end.setDate(end.getDate() + 6)
        const startStr = format(start, 'yyyy-MM-dd')
        const endStr = format(end, 'yyyy-MM-dd')
        return get().workoutLogs.filter(
          (l) => l.date >= startStr && l.date <= endStr
        )
      },

      getLogByDate: (date) => {
        return get().workoutLogs.filter((l) => l.date === date)
      },
    }),
    { name: 'apex-training-store' }
  )
)
