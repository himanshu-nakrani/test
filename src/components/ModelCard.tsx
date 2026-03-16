import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Brain, Code, Eye, Layers, Image, Music, Video, Square, CheckSquare, Star } from 'lucide-react'
import type { AIModel } from '../types'
import Highlight from './Highlight'

interface ModelCardProps {
  model: AIModel
  onClick: (model: AIModel) => void
  isFav: boolean
  onToggleFav: (id: string) => void
  isCompare: boolean
  onToggleCompare: (id: string) => void
  searchQuery?: string
  index?: number
}

function categoryIcon(cat: string): ReactNode {
  const icons: Record<string, ReactNode> = {
    chat: <MessageSquare size={12} aria-hidden="true" />,
    reasoning: <Brain size={12} aria-hidden="true" />,
    code: <Code size={12} aria-hidden="true" />,
    vision: <Eye size={12} aria-hidden="true" />,
    embedding: <Layers size={12} aria-hidden="true" />,
    image: <Image size={12} aria-hidden="true" />,
    audio: <Music size={12} aria-hidden="true" />,
    video: <Video size={12} aria-hidden="true" />,
  }
  return icons[cat] || null
}

export default function ModelCard({
  model,
  onClick,
  isFav,
  onToggleFav,
  isCompare,
  onToggleCompare,
  searchQuery = '',
  index = 0,
}: ModelCardProps) {
  return (
    <motion.div
      className={`model-card ${isCompare ? 'card-compare-selected' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="card-toolbar">
        <label className="compare-check" title="Add to comparison">
          <input
            type="checkbox"
            checked={isCompare}
            onChange={() => onToggleCompare(model.id)}
            aria-label={`Compare ${model.name}`}
          />
          <span className="compare-check-icon" aria-hidden="true">{isCompare ? <CheckSquare size={16} /> : <Square size={16} />}</span>
        </label>
        <button
          className={`fav-btn ${isFav ? 'is-fav' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFav(model.id)
          }}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star size={16} fill={isFav ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>

      <button className="card-body" onClick={() => onClick(model)}>
        {(model.isNew || model.isFeatured) && (
          <div className="card-badges">
            {model.isNew && <span className="badge badge-new">New</span>}
            {model.isFeatured && <span className="badge badge-featured">Featured</span>}
          </div>
        )}

        <div className="card-header">
          <div
            className="provider-dot"
            style={{ background: model.providerColor }}
          />
          <span className="provider-name">{model.provider}</span>
          <span className={`license-badge license-${model.license}`}>
            {model.license === 'open-source'
              ? 'OSS'
              : model.license === 'open-weights'
                ? 'Open'
                : 'Prop'}
          </span>
        </div>

        <h3 className="card-title">
          <Highlight text={model.name} query={searchQuery} />
        </h3>
        <p className="card-description">
          <Highlight text={model.description} query={searchQuery} />
        </p>

        <div className="card-categories">
          {model.categories.map((cat) => (
            <span key={cat} className="category-tag" title={cat}>
              {categoryIcon(cat)} {cat}
            </span>
          ))}
        </div>

        <div className="card-meta">
          <div className="meta-item">
            <span className="meta-label">Context</span>
            <span className="meta-value">{model.contextWindow}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Pricing</span>
            <span className="meta-value">
              {model.pricing.free ? 'Free' : model.pricingTier}
            </span>
          </div>
        </div>
      </button>
    </motion.div>
  )
}
