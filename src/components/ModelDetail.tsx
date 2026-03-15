import type { AIModel } from '../types'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { models } from '../data/models'

interface ModelDetailProps {
  model: AIModel
  onBack: () => void
  onModelClick: (model: AIModel) => void
  isFav: boolean
  onToggleFav: (id: string) => void
}

const categoryEmoji: Record<string, string> = {
  chat: '💬', reasoning: '🧠', code: '💻', vision: '👁️',
  embedding: '📐', image: '🎨', audio: '🎵', video: '🎬',
}

export default function ModelDetail({ model, onBack, onModelClick, isFav, onToggleFav }: ModelDetailProps) {
  const { copy: copyEndpoint, copied: copiedEndpoint } = useCopyToClipboard()
  const { copy: copyName, copied: copiedName } = useCopyToClipboard()

  const related = models
    .filter(
      (m) =>
        m.id !== model.id &&
        (m.provider === model.provider ||
          m.categories.some((c) => model.categories.includes(c))),
    )
    .slice(0, 4)

  return (
    <div className="model-detail">
      <div className="detail-top-bar">
        <button className="back-btn" onClick={onBack}>
          ← Back to all models
        </button>
        <button
          className={`fav-btn fav-btn-lg ${isFav ? 'is-fav' : ''}`}
          onClick={() => onToggleFav(model.id)}
        >
          {isFav ? '★ Favorited' : '☆ Add to favorites'}
        </button>
      </div>

      <div className="detail-hero">
        <div className="detail-hero-top">
          <div>
            <div className="detail-provider">
              <div
                className="provider-dot provider-dot-lg"
                style={{ background: model.providerColor }}
              />
              <span>{model.provider}</span>
              <span className={`license-badge license-${model.license}`}>
                {model.license}
              </span>
              {model.isNew && <span className="badge badge-new">New</span>}
              {model.isFeatured && <span className="badge badge-featured">Featured</span>}
            </div>
            <h1 className="detail-title">
              {model.name}
              <button
                className="copy-name-btn"
                onClick={() => copyName(model.name)}
                title="Copy model name"
              >
                {copiedName ? '✓' : '⧉'}
              </button>
            </h1>
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
              <dd><strong>{model.contextWindow}</strong></dd>
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
              <dd>
                <span className={`pricing-pill pricing-${model.pricingTier}`}>
                  {model.pricing.free ? '🆓 Free' : model.pricingTier}
                </span>
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
              <dd className="api-cell">
                <code className="api-code">{model.apiEndpoint}</code>
                <button
                  className={`copy-btn ${copiedEndpoint ? 'copied' : ''}`}
                  onClick={() => copyEndpoint(model.apiEndpoint)}
                  title="Copy endpoint"
                >
                  {copiedEndpoint ? '✓ Copied' : 'Copy'}
                </button>
              </dd>
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

      {related.length > 0 && (
        <div className="related-section">
          <h2>Related Models</h2>
          <div className="related-grid">
            {related.map((r) => (
              <button
                key={r.id}
                className="related-card"
                onClick={() => {
                  onModelClick(r)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <div className="related-provider">
                  <span className="provider-dot" style={{ background: r.providerColor }} />
                  {r.provider}
                </div>
                <div className="related-name">{r.name}</div>
                <div className="related-desc">{r.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
