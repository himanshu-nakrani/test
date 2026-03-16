import { useState } from 'react'
import type { AIModel } from '../types'
import { comparisonGuides } from '../data/comparisons'
import { models } from '../data/models'

export default function ComparisonGuides({
  onBack,
  onModelClick,
}: {
  onBack: () => void
  onModelClick: (m: AIModel) => void
}) {
  const [activeGuide, setActiveGuide] = useState<string | null>(null)
  const guide = comparisonGuides.find((g) => g.id === activeGuide)

  if (guide) {
    const [m1, m2] = guide.modelIds.map((id) => models.find((m) => m.id === id)!)
    return (
      <div className="guides-page">
        <button className="back-btn" onClick={() => setActiveGuide(null)}>← Back to guides</button>
        <div className="guide-detail">
          <h1 className="guide-title">{guide.title}</h1>
          <p className="guide-subtitle">{guide.subtitle}</p>

          <div className="guide-models-bar">
            {[m1, m2].filter(Boolean).map((m) => (
              <button key={m.id} className="guide-model-chip" onClick={() => onModelClick(m)}>
                <span className="provider-dot" style={{ background: m.providerColor }} />
                {m.name} <span className="guide-chip-arrow">→</span>
              </button>
            ))}
          </div>

          {guide.sections.map((s) => (
            <div key={s.heading} className="guide-section">
              <h3>{s.heading}</h3>
              <p>{s.content}</p>
            </div>
          ))}

          <div className="guide-verdict">
            <h3>🏆 Verdict</h3>
            <p>{guide.verdict}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="guides-page">
      <button className="back-btn" onClick={onBack}>← Back to models</button>
      <div className="guides-hero">
        <h1>📖 Comparison Guides</h1>
        <p>In-depth comparisons of the most popular AI models to help you choose.</p>
      </div>
      <div className="guides-grid">
        {comparisonGuides.map((g) => (
          <button key={g.id} className="guide-card" onClick={() => setActiveGuide(g.id)}>
            <h3>{g.title}</h3>
            <p>{g.subtitle}</p>
            <span className="guide-read-more">Read comparison →</span>
          </button>
        ))}
      </div>
    </div>
  )
}
