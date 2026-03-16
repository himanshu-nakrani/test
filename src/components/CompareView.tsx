import { useNavigate } from 'react-router-dom'
import type { AIModel } from '../types'
import { usePageTitle } from '../hooks/usePageTitle'

interface CompareViewProps {
  models: AIModel[]
  onRemove: (id: string) => void
}

const categoryEmoji: Record<string, string> = {
  chat: '💬', reasoning: '🧠', code: '💻', vision: '👁️',
  embedding: '📐', image: '🎨', audio: '🎵', video: '🎬',
}

export default function CompareView({ models, onRemove }: CompareViewProps) {
  const navigate = useNavigate()
  usePageTitle('Compare Models')

  if (models.length < 2) return null

  const handleModelClick = (m: AIModel) => {
    navigate(`/models/${m.id}`)
  }

  const rows: { label: string; render: (m: AIModel) => React.ReactNode }[] = [
    {
      label: 'Provider',
      render: (m) => (
        <span className="compare-provider">
          <span className="provider-dot" style={{ background: m.providerColor }} />
          {m.provider}
        </span>
      ),
    },
    {
      label: 'Categories',
      render: (m) => (
        <div className="compare-cats">
          {m.categories.map((c) => (
            <span key={c} className="category-tag category-tag-sm">
              {categoryEmoji[c]} {c}
            </span>
          ))}
        </div>
      ),
    },
    { label: 'Parameters', render: (m) => m.parameters },
    { label: 'Context Window', render: (m) => <strong>{m.contextWindow}</strong> },
    { label: 'Input Price', render: (m) => m.pricing.input },
    { label: 'Output Price', render: (m) => m.pricing.output },
    {
      label: 'Pricing Tier',
      render: (m) => (
        <span className={`pricing-pill pricing-${m.pricingTier}`}>
          {m.pricing.free ? 'Free' : m.pricingTier}
        </span>
      ),
    },
    {
      label: 'License',
      render: (m) => (
        <span className={`license-badge license-${m.license}`}>
          {m.license}
        </span>
      ),
    },
    {
      label: 'Release Date',
      render: (m) =>
        new Date(m.releaseDate).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
    },
    {
      label: 'Strengths',
      render: (m) => (
        <ul className="compare-list compare-strengths">
          {m.strengths.map((s) => <li key={s}>{s}</li>)}
        </ul>
      ),
    },
    {
      label: 'Limitations',
      render: (m) => (
        <ul className="compare-list compare-limitations">
          {m.limitations.map((l) => <li key={l}>{l}</li>)}
        </ul>
      ),
    },
  ]

  return (
    <div className="compare-view">
      <div className="compare-header">
        <h2>⚖️ Model Comparison</h2>
        <button className="compare-close" onClick={() => navigate('/')}>✕ Close</button>
      </div>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="compare-label-col"></th>
              {models.map((m) => (
                <th key={m.id} className="compare-model-col">
                  <button className="compare-model-header" onClick={() => handleModelClick(m)}>
                    <span className="compare-model-name">{m.name}</span>
                    <span className="compare-view-detail">View details →</span>
                  </button>
                  <button
                    className="compare-remove"
                    onClick={() => onRemove(m.id)}
                    title="Remove from comparison"
                  >
                    ✕
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="compare-label">{row.label}</td>
                {models.map((m) => (
                  <td key={m.id} className="compare-cell">
                    {row.render(m)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
