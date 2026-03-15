import type { AIModel } from '../types'

interface ModelCardProps {
  model: AIModel
  onClick: (model: AIModel) => void
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

export default function ModelCard({ model, onClick }: ModelCardProps) {
  return (
    <button className="model-card" onClick={() => onClick(model)}>
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

      <h3 className="card-title">{model.name}</h3>
      <p className="card-description">{model.description}</p>

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
            {model.pricing.free ? 'Free' : model.pricingTier}
          </span>
        </div>
      </div>
    </button>
  )
}
