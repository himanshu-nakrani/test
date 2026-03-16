import { LayoutGrid, List, X, MessageSquare, Brain, Code, Eye, Layers, Image, Music, Video } from 'lucide-react'
import type { ModelCategory, PricingTier, LicenseType, FilterState, ViewMode } from '../types'
import { allProviders, allCategories } from '../data/models'

interface FiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  resultCount: number
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

const categoryIcons: Record<ModelCategory, React.ReactNode> = {
  chat: <MessageSquare size={14} aria-hidden="true" />,
  reasoning: <Brain size={14} aria-hidden="true" />,
  code: <Code size={14} aria-hidden="true" />,
  vision: <Eye size={14} aria-hidden="true" />,
  embedding: <Layers size={14} aria-hidden="true" />,
  image: <Image size={14} aria-hidden="true" />,
  audio: <Music size={14} aria-hidden="true" />,
  video: <Video size={14} aria-hidden="true" />,
}
const categoryLabels: Record<ModelCategory, string> = {
  chat: 'Chat', reasoning: 'Reasoning', code: 'Code', vision: 'Vision',
  embedding: 'Embedding', image: 'Image Gen', audio: 'Audio', video: 'Video',
}
const pricingLabels: Record<PricingTier, string> = {
  free: 'Free', low: '$ Low', medium: '$$ Medium', high: '$$$ High', premium: '$$$$ Premium',
}
const licenseLabels: Record<LicenseType, string> = {
  'open-source': 'Open Source', 'open-weights': 'Open Weights', proprietary: 'Proprietary',
}

const contextOptions = [
  { label: 'Any', value: 0 },
  { label: '≥ 32K', value: 32000 },
  { label: '≥ 128K', value: 128000 },
  { label: '≥ 200K', value: 200000 },
  { label: '≥ 1M', value: 1000000 },
]

export default function Filters({ filters, onChange, resultCount, viewMode, onViewModeChange }: FiltersProps) {
  const toggle = <T,>(arr: T[], item: T) => arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]

  const hasActive =
    filters.providers.length > 0 || filters.categories.length > 0 ||
    filters.pricingTiers.length > 0 || filters.licenses.length > 0 ||
    (filters.minContext && filters.minContext > 0) || (filters.minMmlu && filters.minMmlu > 0)

  const clearAll = () => onChange({ ...filters, providers: [], categories: [], pricingTiers: [], licenses: [], minContext: undefined, minMmlu: undefined })

  return (
    <aside className="filters">
      <div className="filters-header">
        <h2>Filters</h2>
        <span className="result-count" aria-live="polite">{resultCount} models</span>
      </div>

      <div className="view-mode-switch">
        <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => onViewModeChange('grid')} title="Grid view"><LayoutGrid size={14} aria-hidden="true" /> Grid</button>
        <button className={`view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => onViewModeChange('table')} title="Table view"><List size={14} aria-hidden="true" /> Table</button>
      </div>

      {hasActive && <button className="clear-filters" onClick={clearAll}><X size={14} aria-hidden="true" /> Clear all filters</button>}

      <div className="filter-section">
        <h3>Provider</h3>
        <div className="filter-chips">
          {allProviders.map((p) => (
            <button key={p} className={`chip ${filters.providers.includes(p) ? 'active' : ''}`} onClick={() => onChange({ ...filters, providers: toggle(filters.providers, p) })}>{p}</button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Category</h3>
        <div className="filter-chips">
          {allCategories.map((c) => (
            <button key={c} className={`chip ${filters.categories.includes(c) ? 'active' : ''}`} onClick={() => onChange({ ...filters, categories: toggle(filters.categories, c) })}>{categoryIcons[c]} {categoryLabels[c]}</button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Context Length</h3>
        <select className="sort-select" value={filters.minContext || 0} onChange={(e) => onChange({ ...filters, minContext: +e.target.value || undefined })}>
          {contextOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="filter-section">
        <h3>Min MMLU Score</h3>
        <div className="range-filter">
          <input
            type="range"
            min={0}
            max={100}
            value={filters.minMmlu || 0}
            onChange={(e) => onChange({ ...filters, minMmlu: +e.target.value || undefined })}
            className="range-input"
          />
          <span className="range-value">{filters.minMmlu ? `≥ ${filters.minMmlu}` : 'Any'}</span>
        </div>
      </div>

      <div className="filter-section">
        <h3>Pricing</h3>
        <div className="filter-chips">
          {(Object.keys(pricingLabels) as PricingTier[]).map((t) => (
            <button key={t} className={`chip ${filters.pricingTiers.includes(t) ? 'active' : ''}`} onClick={() => onChange({ ...filters, pricingTiers: toggle(filters.pricingTiers, t) })}>{pricingLabels[t]}</button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>License</h3>
        <div className="filter-chips">
          {(Object.keys(licenseLabels) as LicenseType[]).map((l) => (
            <button key={l} className={`chip ${filters.licenses.includes(l) ? 'active' : ''}`} onClick={() => onChange({ ...filters, licenses: toggle(filters.licenses, l) })}>{licenseLabels[l]}</button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Sort By</h3>
        <select className="sort-select" value={filters.sortBy} onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}>
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
