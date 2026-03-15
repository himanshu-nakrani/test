import { useState, useEffect, useMemo } from 'react'
import type { AIModel, FilterState } from './types'
import { models } from './data/models'
import Header from './components/Header'
import Hero from './components/Hero'
import Filters from './components/Filters'
import ModelCard from './components/ModelCard'
import ModelDetail from './components/ModelDetail'
import './App.css'

const defaultFilters: FilterState = {
  search: '',
  providers: [],
  categories: [],
  pricingTiers: [],
  licenses: [],
  sortBy: 'name',
}

const contextToNumber = (ctx: string): number => {
  if (ctx === 'N/A') return 0
  const match = ctx.match(/([\d.]+)\s*(M|K)/i)
  if (!match) return 0
  const num = parseFloat(match[1])
  return match[2].toUpperCase() === 'M' ? num * 1_000_000 : num * 1_000
}

const priceTierOrder: Record<string, number> = {
  free: 0,
  low: 1,
  medium: 2,
  high: 3,
  premium: 4,
}

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      darkMode ? 'dark' : 'light',
    )
  }, [darkMode])

  const filtered = useMemo(() => {
    let result = [...models]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.categories.some((c) => c.includes(q)),
      )
    }

    if (filters.providers.length > 0) {
      result = result.filter((m) => filters.providers.includes(m.provider))
    }

    if (filters.categories.length > 0) {
      result = result.filter((m) =>
        m.categories.some((c) => filters.categories.includes(c)),
      )
    }

    if (filters.pricingTiers.length > 0) {
      result = result.filter((m) => filters.pricingTiers.includes(m.pricingTier))
    }

    if (filters.licenses.length > 0) {
      result = result.filter((m) => filters.licenses.includes(m.license))
    }

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'provider':
          return a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name)
        case 'date':
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        case 'context':
          return contextToNumber(b.contextWindow) - contextToNumber(a.contextWindow)
        case 'price':
          return priceTierOrder[a.pricingTier] - priceTierOrder[b.pricingTier]
        default:
          return 0
      }
    })

    return result
  }, [filters])

  const handleModelClick = (model: AIModel) => {
    setSelectedModel(model)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setSelectedModel(null)
  }

  const handleSearch = (value: string) => {
    setFilters((f) => ({ ...f, search: value }))
    if (selectedModel) setSelectedModel(null)
  }

  return (
    <div className="app">
      <Header
        search={filters.search}
        onSearchChange={handleSearch}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(!darkMode)}
        onLogoClick={handleBack}
        modelCount={models.length}
      />

      {selectedModel ? (
        <main className="main">
          <ModelDetail model={selectedModel} onBack={handleBack} />
        </main>
      ) : (
        <>
          <Hero />
          <main className="main">
            <button
              className="mobile-filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '✕ Hide Filters' : '☰ Show Filters'}
            </button>

            <div className="content-layout">
              <div className={`filters-container ${showFilters ? 'show' : ''}`}>
                <Filters
                  filters={filters}
                  onChange={setFilters}
                  resultCount={filtered.length}
                />
              </div>

              <div className="model-grid">
                {filtered.length === 0 ? (
                  <div className="no-results">
                    <span className="no-results-icon">🔍</span>
                    <h3>No models found</h3>
                    <p>Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  filtered.map((model) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      onClick={handleModelClick}
                    />
                  ))
                )}
              </div>
            </div>
          </main>
        </>
      )}

      <footer className="footer">
        <p>
          AI Models Hub — Explore {models.length} models from top AI providers
          &middot; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}

export default App
