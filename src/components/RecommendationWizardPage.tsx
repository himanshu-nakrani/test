import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { models } from '../data/models'
import { getRecommendations } from '../utils/recommendationEngine'
import type { RecommendationRequest, RecommendationResult } from '../types'
import RecommendationWizard from './RecommendationWizard'
import RecommendationResults from './RecommendationResults'

type PageState = 'wizard' | 'results'

export default function RecommendationWizardPage() {
  const [pageState, setPageState] = useState<PageState>('wizard')
  const [results, setResults] = useState<RecommendationResult[]>([])
  const navigate = useNavigate()

  const handleWizardComplete = (request: RecommendationRequest) => {
    const recommendations = getRecommendations(request, models)
    setResults(recommendations)
    setPageState('results')
  }

  const handleViewDetails = (modelId: string) => {
    navigate(`/models/${modelId}`)
  }

  const handleCompare = () => {
    // The comparison is handled by RecommendationResults component
  }

  return (
    <motion.main
      className="main recommendation-page"
      role="main"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="recommendation-container">
        {pageState === 'wizard' ? (
          <RecommendationWizard onComplete={handleWizardComplete} />
        ) : (
          <RecommendationResults
            results={results}
            onCompare={handleCompare}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>
    </motion.main>
  )
}
