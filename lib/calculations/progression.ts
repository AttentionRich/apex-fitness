import { LoggedSet, ExerciseCategory, ProgressionSuggestion } from '@/types/training'

type ProgressionInput = {
  exerciseId: string
  exerciseName: string
  currentWeight: number
  repRangeMin: number
  repRangeMax: number
  setResults: LoggedSet[]
  category: ExerciseCategory
}

const INCREMENTS: Record<ExerciseCategory, number> = {
  upper: 2.5,
  lower: 5,
  isolation: 1.25,
  other: 2.5,
}

export function getSuggestedNextWeight(
  params: ProgressionInput
): ProgressionSuggestion {
  const {
    exerciseId,
    exerciseName,
    currentWeight,
    repRangeMin,
    repRangeMax,
    setResults,
    category,
  } = params

  const completedSets = setResults.filter((s) => s.completed)
  if (completedSets.length === 0) {
    return {
      exerciseId,
      exerciseName,
      currentWeight,
      suggestedWeight: currentWeight,
      status: 'maintain',
      reason: 'No completed sets recorded.',
      increment: 0,
    }
  }

  const increment = INCREMENTS[category]
  const allSetsHitTop = completedSets.every((s) => s.reps >= repRangeMax)
  const anySetBelowMin = completedSets.some((s) => s.reps < repRangeMin)
  const mostSetsBelowMin =
    completedSets.filter((s) => s.reps < repRangeMin).length >
    completedSets.length / 2

  if (allSetsHitTop) {
    return {
      exerciseId,
      exerciseName,
      currentWeight,
      suggestedWeight: currentWeight + increment,
      status: 'increase',
      reason: `You hit ${repRangeMax}+ reps on all sets. Time to add weight.`,
      increment,
    }
  }

  if (mostSetsBelowMin) {
    return {
      exerciseId,
      exerciseName,
      currentWeight,
      suggestedWeight: currentWeight - increment,
      status: 'reduce',
      reason: `Several sets missed the ${repRangeMin} rep minimum. Consider a small reduction.`,
      increment: -increment,
    }
  }

  if (anySetBelowMin) {
    return {
      exerciseId,
      exerciseName,
      currentWeight,
      suggestedWeight: currentWeight,
      status: 'maintain',
      reason: `You're close — hold this weight and aim to hit ${repRangeMin}–${repRangeMax} reps on all sets.`,
      increment: 0,
    }
  }

  return {
    exerciseId,
    exerciseName,
    currentWeight,
    suggestedWeight: currentWeight,
    status: 'maintain',
    reason: `Working solidly in the ${repRangeMin}–${repRangeMax} rep range. Keep going.`,
    increment: 0,
  }
}

export function calculateEstimated1RM(weight: number, reps: number): number {
  // Epley formula
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

export function calculateTotalVolume(sets: LoggedSet[]): number {
  return sets
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.weight * s.reps, 0)
}
