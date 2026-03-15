import type { ModelCategory, PricingTier, LicenseType, FilterState, ViewMode } from '../types'
import { allProviders, allCategories } from '../data/models'

interface FiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  resultCount: number
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

const categoryLabels: Record<ModelCategory, string> = {
  chat: '💬 Chat',
  reasoning: '🧠 Reasoning',
  code: '💻 Code',
  vision: '👁️ Vision',
  embedding: '📐 Embedding',
  image: '🎨 Image Gen',
  audio: '🎵 Audio',
  video: '🎬 Video',
}

const pricingLabels: Record<PricingTier, string> = {
  free: 'Free',
  low: '$ Low',
  medium: '$$ Medium',
  high: '$$$ High',
  premium: '$$$$ Premium',
}

const licenseLabels: Record<LicenseType, string> = {
  'open-source': 'Open Source',
  'open-weights': 'Open Weights',
  proprietary: 'Proprietary',
}

export default function Filters({ filters, onChange, resultCount, viewMode, onViewModeChange }: FiltersProps) {
  const toggleProvider = (p: string) => {
    const next = filters.providers.includes(p)
      ? filters.providers.filter((x) => x !== p)
      : [...filters.providers, p]
    onChange({ ...filters, providers: next })
  }

  const toggleCategory = (c: ModelCategory) => {
    const next = filters.categories.includes(c)
      ? filters.categories.filter((x) => x !== c)
      : [...filters.categories, c]
    onChange({ ...filters, categories: next })
  }

  const togglePricing = (t: PricingTier) => {
    const next = filters.pricingTiers.includes(t)
      ? filters.pricingTiers.filter((x) => x !== t)
      : [...filters.pricingTiers, t]
    onChange({ ...filters, pricingTiers: next })
  }

  const toggleLicense = (l: LicenseType) => {
    const next = filters.licenses.includes(l)
      ? filters.licenses.filter((x) => x !== l)
      : [...filters.licenses, l]
    onChange({ ...filters, licenses: next })
  }

  const hasActiveFilters =
    filters.providers.length > 0 ||
    filters.categories.length > 0 ||
    filters.pricingTiers.length > 0 ||
    filters.licenses.length > 0

  const clearAll = () =>
    onChange({
      ...filters,
      providers: [],
      categories: [],
      pricingTiers: [],
      licenses: [],
    })

  return (
    <aside className="filters">
      <div className="filters-header">
        <h2>Filters</h2>
        <span className="result-count">{resultCount} models</span>
      </div>

      <div className="view-mode-switch">
        <button
          className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => onViewModeChange('grid')}
          title="Grid view"
        >
          ▦ Grid
        </button>
        <button
          className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => onViewModeChange('table')}
          title="Table view"
        >
          ≡ Table
        </button>
      </div>

      {hasActiveFilters && (
        <button className="clear-filters" onClick={clearAll}>
          ✕ Clear all filters
        </button>
      )}

      <div className="filter-section">
        <h3>Provider</h3>
        <div className="filter-chips">
          {allProviders.map((p) => (
            <button
              key={p}
              className={`chip ${filters.providers.includes(p) ? 'active' : ''}`}
              onClick={() => toggleProvider(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Category</h3>
        <div className="filter-chips">
          {allCategories.map((c) => (
            <button
              key={c}
              className={`chip ${filters.categories.includes(c) ? 'active' : ''}`}
              onClick={() => toggleCategory(c)}
            >
              {categoryLabels[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Pricing</h3>
        <div className="filter-chips">
          {(Object.keys(pricingLabels) as PricingTier[]).map((t) => (
            <button
              key={t}
              className={`chip ${filters.pricingTiers.includes(t) ? 'active' : ''}`}
              onClick={() => togglePricing(t)}
            >
              {pricingLabels[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>License</h3>
        <div className="filter-chips">
          {(Object.keys(licenseLabels) as LicenseType[]).map((l) => (
            <button
              key={l}
              className={`chip ${filters.licenses.includes(l) ? 'active' : ''}`}
              onClick={() => toggleLicense(l)}
            >
              {licenseLabels[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Sort By</h3>
        <select
          className="sort-select"
          value={filters.sortBy}
          onChange={(e) =>
            onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })
          }
        >
          <option value="name">Name (A-Z)</option>
          <option value="provider">Provider</option>
          <option value="date">Release Date (Newest)</option>
          <option value="context">Context Window</option>
          <option value="price">Price (Low to High)</option>
        </select>
      </div>
    </aside>
  )
}
