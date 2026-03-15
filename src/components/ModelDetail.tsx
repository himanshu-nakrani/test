import type { AIModel } from '../types'

interface ModelDetailProps {
  model: AIModel
  onBack: () => void
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

export default function ModelDetail({ model, onBack }: ModelDetailProps) {
  return (
    <div className="model-detail">
      <button className="back-btn" onClick={onBack}>
        ← Back to all models
      </button>

      <div className="detail-hero">
        <div className="detail-hero-top">
          <div>
            <div className="detail-provider">
              <div
                className="provider-dot"
                style={{ background: model.providerColor }}
              />
              <span>{model.provider}</span>
              <span className={`license-badge license-${model.license}`}>
                {model.license}
              </span>
              {model.isNew && <span className="badge badge-new">New</span>}
            </div>
            <h1 className="detail-title">{model.name}</h1>
            <p className="detail-description">{model.longDescription}</p>
          </div>
        </div>

        <div className="detail-categories">
          {model.categories.map((cat) => (
            <span key={cat} className="category-tag category-tag-lg">
              {categoryEmoji[cat]} {cat}
            </span>
          ))}
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h3>📊 Specifications</h3>
          <dl className="spec-list">
            <div className="spec-row">
              <dt>Parameters</dt>
              <dd>{model.parameters}</dd>
            </div>
            <div className="spec-row">
              <dt>Context Window</dt>
              <dd>{model.contextWindow}</dd>
            </div>
            <div className="spec-row">
              <dt>Release Date</dt>
              <dd>{new Date(model.releaseDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</dd>
            </div>
            <div className="spec-row">
              <dt>License</dt>
              <dd className="capitalize">{model.license}</dd>
            </div>
          </dl>
        </div>

        <div className="detail-card">
          <h3>💰 Pricing</h3>
          <dl className="spec-list">
            <div className="spec-row">
              <dt>Input</dt>
              <dd>{model.pricing.input}</dd>
            </div>
            <div className="spec-row">
              <dt>Output</dt>
              <dd>{model.pricing.output}</dd>
            </div>
            <div className="spec-row">
              <dt>Tier</dt>
              <dd className="capitalize">
                {model.pricing.free ? '🆓 Free' : model.pricingTier}
              </dd>
            </div>
          </dl>
        </div>

        <div className="detail-card">
          <h3>✅ Strengths</h3>
          <ul className="detail-list strengths-list">
            {model.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="detail-card">
          <h3>⚠️ Limitations</h3>
          <ul className="detail-list limitations-list">
            {model.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>

        <div className="detail-card detail-card-wide">
          <h3>🎯 Use Cases</h3>
          <div className="use-case-grid">
            {model.useCases.map((u) => (
              <div key={u} className="use-case-item">
                {u}
              </div>
            ))}
          </div>
        </div>

        <div className="detail-card detail-card-wide">
          <h3>🔗 API & Documentation</h3>
          <dl className="spec-list">
            <div className="spec-row">
              <dt>API Endpoint</dt>
              <dd className="mono">{model.apiEndpoint}</dd>
            </div>
            <div className="spec-row">
              <dt>Documentation</dt>
              <dd>
                <a
                  href={model.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="doc-link"
                >
                  {model.documentationUrl} ↗
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
