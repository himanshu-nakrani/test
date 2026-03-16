import type { AIModel } from '../types'

interface ModelTableProps {
  models: AIModel[]
  onClick: (model: AIModel) => void
  isFav: (id: string) => boolean
  onToggleFav: (id: string) => void
  compareSet: Set<string>
  onToggleCompare: (id: string) => void
}

export default function ModelTable({
  models,
  onClick,
  isFav,
  onToggleFav,
  compareSet,
  onToggleCompare,
}: ModelTableProps) {
  return (
    <div className="table-wrapper">
      <table className="model-table">
        <thead>
          <tr>
            <th className="th-check"></th>
            <th className="th-fav"></th>
            <th>Model</th>
            <th>Provider</th>
            <th>Categories</th>
            <th>Context</th>
            <th>Pricing</th>
            <th>License</th>
            <th>Released</th>
          </tr>
        </thead>
        <tbody>
          {models.map((m) => (
            <tr
              key={m.id}
              className={`table-row ${compareSet.has(m.id) ? 'row-selected' : ''}`}
              onClick={() => onClick(m)}
            >
              <td className="td-check" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={compareSet.has(m.id)}
                  onChange={() => onToggleCompare(m.id)}
                />
              </td>
              <td className="td-fav" onClick={(e) => e.stopPropagation()}>
                <button
                  className={`table-fav ${isFav(m.id) ? 'is-fav' : ''}`}
                  onClick={() => onToggleFav(m.id)}
                >
                  {isFav(m.id) ? '★' : '☆'}
                </button>
              </td>
              <td className="td-model">
                <div className="table-model-name">
                  {m.name}
                  {m.isNew && <span className="badge badge-new badge-sm">New</span>}
                </div>
              </td>
              <td>
                <span className="table-provider">
                  <span
                    className="provider-dot"
                    style={{ background: m.providerColor }}
                  />
                  {m.provider}
                </span>
              </td>
              <td className="td-categories">
                {m.categories.slice(0, 3).map((c) => (
                  <span key={c} className="category-tag category-tag-sm">{c}</span>
                ))}
                {m.categories.length > 3 && (
                  <span className="category-tag category-tag-sm">+{m.categories.length - 3}</span>
                )}
              </td>
              <td className="td-mono">{m.contextWindow}</td>
              <td>
                <span className={`pricing-pill pricing-${m.pricingTier}`}>
                  {m.pricing.free ? 'Free' : m.pricingTier}
                </span>
              </td>
              <td>
                <span className={`license-badge license-${m.license}`}>
                  {m.license === 'open-source' ? 'OSS' : m.license === 'open-weights' ? 'Open' : 'Prop'}
                </span>
              </td>
              <td className="td-date">
                {new Date(m.releaseDate).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
