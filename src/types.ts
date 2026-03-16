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
  benchmarks?: BenchmarkScores
  codeSnippets?: CodeSnippet[]
  tags?: string[]
}

export type ViewMode = 'grid' | 'table'

export type AppPage = 'home' | 'detail' | 'compare' | 'leaderboard' | 'calculator'

export interface FilterState {
  search: string
  providers: string[]
  categories: ModelCategory[]
  pricingTiers: PricingTier[]
  licenses: LicenseType[]
  sortBy: 'name' | 'provider' | 'date' | 'context' | 'price'
  minContext?: number
  maxContext?: number
  minMmlu?: number
}
