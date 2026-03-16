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
}

const categoryEmoji: Record<string, string> = {
  chat: '💬',
  reasoning: '🧠',
  code: '💻',
  vision: '👁️',
  embedding: '📐',
  image: '🎨',
  audio: '🎵',
  video: '🎬',
}

export default function ModelCard({
  model,
  onClick,
  isFav,
  onToggleFav,
  isCompare,
  onToggleCompare,
  searchQuery = '',
}: ModelCardProps) {
  return (
    <div className={`model-card ${isCompare ? 'card-compare-selected' : ''}`}>
      <div className="card-toolbar">
        <label className="compare-check" title="Add to comparison">
          <input
            type="checkbox"
            checked={isCompare}
            onChange={() => onToggleCompare(model.id)}
            aria-label={`Compare ${model.name}`}
          />
          <span className="compare-check-icon" aria-hidden="true">{isCompare ? '☑' : '☐'}</span>
        </label>
        <button
          className={`fav-btn ${isFav ? 'is-fav' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFav(model.id)
          }}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFav ? '★' : '☆'}
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
              {categoryEmoji[cat]} {cat}
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
              {model.pricing.free ? '🆓 Free' : model.pricingTier}
            </span>
          </div>
        </div>
      </button>
    </div>
  )
}
