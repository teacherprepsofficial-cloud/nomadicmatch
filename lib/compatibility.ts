export interface CategoryScores {
  travel_pace: number
  lifestyle_stability: number
  social_energy: number
  relationship_goals: number
  values_alignment: number
  communication_style: number
}

const WEIGHTS: Record<keyof CategoryScores, number> = {
  relationship_goals: 0.30,
  values_alignment: 0.20,
  travel_pace: 0.20,
  lifestyle_stability: 0.15,
  communication_style: 0.10,
  social_energy: 0.05,
}

export function computeCompatibility(
  scoresA: CategoryScores,
  scoresB: CategoryScores
): number {
  let weightedDistanceSum = 0
  let totalWeight = 0

  for (const key of Object.keys(WEIGHTS) as (keyof CategoryScores)[]) {
    const a = scoresA[key] ?? 0.5
    const b = scoresB[key] ?? 0.5
    const distance = Math.abs(a - b) // both are 0-1, max distance = 1
    weightedDistanceSum += WEIGHTS[key] * distance
    totalWeight += WEIGHTS[key]
  }

  const weightedAvgDistance = weightedDistanceSum / totalWeight
  return Math.round((1 - weightedAvgDistance) * 100)
}

// Normalize raw Likert answers (1-5) to 0-1 per category
export function computeCategoryScores(
  answers: { questionId: string; category: string; value: number }[]
): CategoryScores {
  const categoryMap: Record<string, number[]> = {}

  for (const answer of answers) {
    if (!categoryMap[answer.category]) {
      categoryMap[answer.category] = []
    }
    categoryMap[answer.category].push(answer.value)
  }

  function avg(values: number[]): number {
    if (!values || values.length === 0) return 0.5
    const sum = values.reduce((a, b) => a + b, 0)
    // normalize from 1-5 scale to 0-1
    return (sum / values.length - 1) / 4
  }

  return {
    travel_pace: avg(categoryMap['travel_pace'] || []),
    lifestyle_stability: avg(categoryMap['lifestyle_stability'] || []),
    social_energy: avg(categoryMap['social_energy'] || []),
    relationship_goals: avg(categoryMap['relationship_goals'] || []),
    values_alignment: avg(categoryMap['values_alignment'] || []),
    communication_style: avg(categoryMap['communication_style'] || []),
  }
}
