export type ModelCategory = 'chat' | 'reasoning' | 'code' | 'vision' | 'embedding' | 'image' | 'audio' | 'video'

export type PricingTier = 'free' | 'low' | 'medium' | 'high' | 'premium'

export type LicenseType = 'proprietary' | 'open-source' | 'open-weights'

export interface ModelPricing {
  input: string
  output: string
  free?: boolean
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
}

export type ViewMode = 'grid' | 'table'

export interface FilterState {
  search: string
  providers: string[]
  categories: ModelCategory[]
  pricingTiers: PricingTier[]
  licenses: LicenseType[]
  sortBy: 'name' | 'provider' | 'date' | 'context' | 'price'
}
