export type ModelCategory = 'chat' | 'reasoning' | 'code' | 'vision' | 'embedding' | 'image' | 'audio' | 'video'

export type PricingTier = 'free' | 'low' | 'medium' | 'high' | 'premium'

export type LicenseType = 'proprietary' | 'open-source' | 'open-weights'

export type Modality = 'text' | 'image' | 'audio' | 'video' | 'code' | 'embeddings'

export interface ModelPricing {
  input: string
  output: string
  free?: boolean
  inputPerMillion?: number
  outputPerMillion?: number
}

export interface BenchmarkScores {
  mmlu?: number
  humanEval?: number
  gsm8k?: number
  mtBench?: number
  arc?: number
  hellaswag?: number
  [key: string]: number | undefined
}

export interface CodeSnippet {
  language: 'python' | 'javascript' | 'curl'
  label: string
  code: string
}

export interface ModelVersion {
  version: string
  date: string
  notes: string
}

export interface RateLimits {
  rpm?: string
  tpm?: string
  notes?: string
}

export interface LatencyInfo {
  label: string
  ttfb?: string
  tokensPerSec?: string
}

export interface AIModel {
  id: string
  name: string
  provider: string
  providerColor: string
  description: string
  longDescription: string
  categories: ModelCategory[]
  parameters: string
  contextWindow: string
  contextTokens?: number
  releaseDate: string
  lastUpdated?: string
  pricing: ModelPricing
  pricingTier: PricingTier
  license: LicenseType
  strengths: string[]
  limitations: string[]
  useCases: string[]
  apiEndpoint: string
  documentationUrl: string
  isNew?: boolean
  isFeatured?: boolean
  inputModalities?: Modality[]
  outputModalities?: Modality[]
  latency?: string
  latencyInfo?: LatencyInfo
  benchmarks?: BenchmarkScores
  codeSnippets?: CodeSnippet[]
  tags?: string[]
  versions?: ModelVersion[]
  rateLimits?: RateLimits
  modelSize?: string
}

export type ViewMode = 'grid' | 'table'

export type AppPage = 'home' | 'detail' | 'compare' | 'leaderboard' | 'calculator' | 'guides' | 'analytics' | 'workspace'

export interface FilterState {
  search: string
  providers: string[]
  categories: ModelCategory[]
  pricingTiers: PricingTier[]
  licenses: LicenseType[]
  sortBy: 'name' | 'provider' | 'date' | 'context' | 'price' | 'trending'
  secondarySortBy?: 'name' | 'provider' | 'date' | 'context' | 'price'
  minContext?: number
  maxContext?: number
  minMmlu?: number
}

export interface RecommendationRequest {
  useCase: ModelCategory | 'custom'
  performanceLevel: 'cost-optimized' | 'balanced' | 'high-performance'
  minContextTokens?: number
  speedRequired: 'flexible' | 'moderate' | 'critical'
  modalitiesNeeded: Modality[]
  licensePreference: 'any' | 'open-source' | 'open-weights'
  budgetRange: 'free' | 'low' | 'medium' | 'high' | 'premium'
  estimatedMonthlyTokens?: number
}

export interface RecommendationResult {
  model: AIModel
  score: number
  reasons: string[]
  estimatedMonthlyCost?: number
}
