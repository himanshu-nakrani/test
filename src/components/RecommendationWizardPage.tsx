import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { models } from '../data/models'
import type { RecommendationResult } from '../types'
import RecommendationWizard from './RecommendationWizard'
import RecommendationResults from './RecommendationResults'

type PageState = 'wizard' | 'results'

export default function RecommendationWizardPage() {
  const [pageState, setPageState] = useState<PageState>('wizard')
  const [results, setResults] = useState<RecommendationResult[]>([])
  const navigate = useNavigate()

  const handleResultsReady = (recommendations: RecommendationResult[]) => {
    setResults(recommendations)
    setPageState('results')
  }

  const handleViewDetails = (modelId: string) => {
    navigate(`/models/${modelId}`)
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
          <RecommendationWizard models={models} onResultsReady={handleResultsReady} />
        ) : (
          <RecommendationResults
            results={results}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>
    </motion.main>
  )
}
