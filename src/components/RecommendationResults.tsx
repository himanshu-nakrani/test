import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, AlertCircle, TrendingUp } from 'lucide-react'
import type { RecommendationResult } from '../types'

interface RecommendationResultsProps {
  results: RecommendationResult[]
  onCompare: (modelIds: string[]) => void
  onViewDetails: (modelId: string) => void
}

export default function RecommendationResults({
  results,
  onCompare,
  onViewDetails,
}: RecommendationResultsProps) {
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set())
  const navigate = useNavigate()

  const toggleSelected = (modelId: string) => {
    const next = new Set(selectedForCompare)
    if (next.has(modelId)) next.delete(modelId)
    else next.add(modelId)
    setSelectedForCompare(next)
  }

  const handleCompare = () => {
    if (selectedForCompare.size >= 2) {
      const ids = Array.from(selectedForCompare).join(',')
      navigate(`/compare?models=${ids}`)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div className="recommendation-results" variants={container} initial="hidden" animate="show">
      <div className="results-header">
        <h2>Recommended Models</h2>
        <p className="results-subtitle">Based on your requirements, here are the best options for you.</p>
      </div>

      <motion.div className="results-list" variants={container}>
        {results.map((result, idx) => (
          <motion.div key={result.model.id} className="recommendation-card" variants={item}>
            <div className="card-rank">#{idx + 1}</div>

            <div className="card-content">
              <div className="card-header">
                <div className="model-info">
                  <h3 className="model-name">{result.model.name}</h3>
                  <p className="model-provider">{result.model.provider}</p>
                </div>
                <div className="match-score">
                  <div className="score-display">
                    <span className="score-number">{Math.round(result.score)}%</span>
                    <span className="score-label">Match</span>
                  </div>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${result.score}%` }} />
                  </div>
                </div>
              </div>

              <p className="card-description">{result.model.description}</p>

              <div className="reasons-section">
                <div className="reasons-label">
                  <Check size={14} /> Why it matches
                </div>
                <div className="reason-badges">
                  {result.reasons.map((reason, i) => (
                    <span key={i} className="reason-badge">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card-stats">
                <div className="stat-item">
                  <span className="stat-label">Context</span>
                  <span className="stat-value">{result.model.contextWindow}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Pricing</span>
                  <span className="stat-value">{result.model.pricingTier}</span>
                </div>
                {result.estimatedMonthlyCost && (
                  <div className="stat-item">
                    <span className="stat-label">Est. Monthly</span>
                    <span className="stat-value">${result.estimatedMonthlyCost.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="card-actions">
                <label className="compare-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedForCompare.has(result.model.id)}
                    onChange={() => toggleSelected(result.model.id)}
                  />
                  <span>Compare</span>
                </label>
                <button className="view-details-btn" onClick={() => onViewDetails(result.model.id)}>
                  View Details <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {selectedForCompare.size >= 2 && (
        <motion.div className="compare-sticky" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="compare-info">
            <TrendingUp size={18} />
            <span>{selectedForCompare.size} models selected for comparison</span>
          </div>
          <button className="compare-action-btn" onClick={handleCompare}>
            Compare Now <ArrowRight size={16} />
          </button>
        </motion.div>
      )}

      <div className="results-footer">
        <Link to="/" className="back-to-models">
          <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to all models
        </Link>
      </div>
    </motion.div>
  )
}
