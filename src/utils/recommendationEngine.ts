import type { AIModel, RecommendationRequest, RecommendationResult } from '../types'

/**
 * Scoring algorithm for model recommendations
 * Weights:
 * - Use case alignment: 30%
 * - Performance level: 25%
 * - Cost alignment: 25%
 * - Speed requirement: 10%
 * - Tech requirements: 10%
 */

export function recommendModels(
  models: AIModel[],
  request: RecommendationRequest,
): RecommendationResult[] {
  const scores = models.map((model) => ({
    model,
    score: calculateScore(model, request),
    reasons: getReasons(model, request),
  }))

  // Filter out very low scores and sort by score descending
  return scores
    .filter((r) => r.score > 0.2)
    .sort((a, b) => b.score - a.score)
}

function calculateScore(model: AIModel, request: RecommendationRequest): number {
  let score = 0

  // Use case alignment (30%)
  score += calculateUseCaseScore(model, request) * 0.3

  // Performance level (25%)
  score += calculatePerformanceScore(model, request) * 0.25

  // Cost alignment (25%)
  score += calculateCostScore(model, request) * 0.25

  // Speed requirement (10%)
  score += calculateSpeedScore(model, request) * 0.1

  // Tech requirements (10%)
  score += calculateTechScore(model, request) * 0.1

  return Math.min(score, 1.0) // Cap at 1.0
}

function calculateUseCaseScore(model: AIModel, request: RecommendationRequest): number {
  if (request.useCase === 'custom') return 0.5 // Default for custom

  // Check if model's categories match the use case
  const categoryMap: Record<string, string[]> = {
    chat: ['chat'],
    reasoning: ['reasoning'],
    code: ['code'],
    vision: ['vision'],
    embedding: ['embedding'],
    image: ['image'],
    audio: ['audio'],
    video: ['video'],
  }

  const targetCategories = categoryMap[request.useCase] || []
  const matchCount = targetCategories.filter((cat) => model.categories.includes(cat as any)).length

  return matchCount > 0 ? 1.0 : 0.3
}

function calculatePerformanceScore(model: AIModel, request: RecommendationRequest): number {
  const tier = model.pricingTier
  const tierRanking: Record<string, number> = {
    free: 0.4,
    low: 0.6,
    medium: 0.8,
    high: 0.95,
    premium: 1.0,
  }

  const tierScore = tierRanking[tier] || 0.5

  switch (request.performanceLevel) {
    case 'cost-optimized':
      // Prefer lower tier models
      return Math.max(0, 1.0 - tierScore * 0.5)
    case 'balanced':
      // Prefer medium tier (around 0.7-0.8 is best)
      return 1.0 - Math.abs(tierScore - 0.75) * 0.8
    case 'high-performance':
      // Prefer higher tier models
      return tierScore
    default:
      return 0.5
  }
}

function calculateCostScore(model: AIModel, request: RecommendationRequest): number {
  const pricingTiers = {
    free: 0,
    low: 1,
    medium: 2,
    high: 3,
    premium: 4,
  }

  const budgetMap: Record<string, number> = {
    free: 0,
    low: 1,
    medium: 2,
    high: 3,
    premium: 4,
  }

  const modelTierScore = pricingTiers[model.pricingTier]
  const budgetScore = budgetMap[request.budgetRange]

  // Score based on how well pricing matches budget
  const tierDiff = Math.abs(modelTierScore - budgetScore)
  return Math.max(0, 1.0 - tierDiff * 0.2)
}

function calculateSpeedScore(model: AIModel, request: RecommendationRequest): number {
  const latencyLabel = model.latencyInfo?.label?.toLowerCase() || ''

  switch (request.speedRequired) {
    case 'flexible':
      // Any speed is fine
      return 0.8
    case 'moderate':
      // Prefer fast or moderate
      return latencyLabel.includes('fast') ? 1.0 : latencyLabel.includes('moderate') ? 0.8 : 0.5
    case 'critical':
      // Must be fast
      return latencyLabel.includes('fast') ? 1.0 : 0.4
    default:
      return 0.7
  }
}

function calculateTechScore(model: AIModel, request: RecommendationRequest): number {
  let score = 1.0

  // Check context window requirement
  if (
    request.minContextTokens &&
    model.contextTokens &&
    model.contextTokens < request.minContextTokens
  ) {
    score -= 0.3
  }

  // Check modality requirements
  if (request.modalitiesNeeded && request.modalitiesNeeded.length > 0) {
    const modelModalities = [
      ...(model.inputModalities || []),
      ...(model.outputModalities || []),
    ]
    const matchedModalities = request.modalitiesNeeded.filter((m) => modelModalities.includes(m))
    const modalityScore = matchedModalities.length / request.modalitiesNeeded.length
    score = score * (0.5 + modalityScore * 0.5) // Weight modality match
  }

  // Check license preference
  if (request.licensePreference !== 'any') {
    if (
      request.licensePreference === 'open-source' &&
      model.license === 'open-source'
    ) {
      score += 0.2
    } else if (
      request.licensePreference === 'open-weights' &&
      (model.license === 'open-source' || model.license === 'open-weights')
    ) {
      score += 0.1
    } else if (request.licensePreference !== 'any' && model.license === 'proprietary') {
      score -= 0.15
    }
  }

  return Math.min(score, 1.0)
}

function getReasons(model: AIModel, request: RecommendationRequest): string[] {
  const reasons: string[] = []

  // Use case alignment
  if (request.useCase !== 'custom') {
    const categoryMap: Record<string, string> = {
      chat: 'Chat',
      reasoning: 'Reasoning',
      code: 'Code Generation',
      vision: 'Vision',
      embedding: 'Embeddings',
      image: 'Image Generation',
      audio: 'Audio',
      video: 'Video',
    }
    const targetCategory = categoryMap[request.useCase]
    if (model.categories.includes(request.useCase as any)) {
      reasons.push(`Specialized in ${targetCategory}`)
    }
  }

  // Performance tier
  if (request.performanceLevel === 'cost-optimized' && model.pricingTier === 'low') {
    reasons.push('Excellent cost efficiency')
  } else if (
    request.performanceLevel === 'balanced' &&
    (model.pricingTier === 'medium' || model.pricingTier === 'low')
  ) {
    reasons.push('Great balance of power and cost')
  } else if (request.performanceLevel === 'high-performance' && model.pricingTier === 'premium') {
    reasons.push('Top-tier performance')
  }

  // Speed
  if (
    request.speedRequired === 'critical' &&
    model.latencyInfo?.label?.toLowerCase().includes('fast')
  ) {
    reasons.push('Fast inference speed')
  }

  // Special features
  if (model.isFeatured) {
    reasons.push('Featured model')
  }
  if (model.isNew) {
    reasons.push('Recently released')
  }

  // Modality support
  if (model.inputModalities && model.inputModalities.length > 2) {
    reasons.push(`Supports multiple modalities`)
  }

  // Benchmarks
  if (model.benchmarks?.mmlu && model.benchmarks.mmlu > 85) {
    reasons.push('Excellent benchmark scores')
  }

  return reasons.slice(0, 3) // Return top 3 reasons
}
