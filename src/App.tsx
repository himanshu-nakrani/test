import { useState, useEffect, useMemo, useCallback } from 'react'
import type { AIModel, FilterState, ViewMode, AppPage } from './types'
import { models } from './data/models'
import { useFavorites } from './hooks/useFavorites'
import Header from './components/Header'
import Hero from './components/Hero'
import Filters from './components/Filters'
import ModelCard from './components/ModelCard'
import ModelTable from './components/ModelTable'
import ModelDetail from './components/ModelDetail'
import CompareView from './components/CompareView'
import Leaderboard from './components/Leaderboard'
import CostCalculator from './components/CostCalculator'
import ComparisonGuides from './components/ComparisonGuides'
import './App.css'

const defaultFilters: FilterState = {
  search: '', providers: [], categories: [], pricingTiers: [], licenses: [], sortBy: 'name',
}

const contextToNumber = (ctx: string): number => {
  if (ctx === 'N/A') return 0
  const match = ctx.match(/([\d.]+)\s*(M|K)/i)
  if (!match) return 0
  const num = parseFloat(match[1])
  return match[2].toUpperCase() === 'M' ? num * 1_000_000 : num * 1_000
}

const priceTierOrder: Record<string, number> = { free: 0, low: 1, medium: 2, high: 3, premium: 4 }

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('neural-atlas-theme') === 'dark' } catch { return false }
  })
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set())
  const [page, setPage] = useState<AppPage>('home')
  const [showFavOnly, setShowFavOnly] = useState(false)

  const { toggle: toggleFav, isFav, count: favCount } = useFavorites()

  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('neural-atlas-theme', theme) } catch { /* noop */ }
  }, [darkMode])

  const toggleCompare = useCallback((id: string) => {
    setCompareSet((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }, [])

  const filtered = useMemo(() => {
    let result = [...models]
    if (showFavOnly) result = result.filter((m) => isFav(m.id))
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter((m) =>
        m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) || m.categories.some((c) => c.includes(q)) ||
        (m.tags || []).some((t) => t.toLowerCase().includes(q)),
      )
    }
    if (filters.providers.length > 0) result = result.filter((m) => filters.providers.includes(m.provider))
    if (filters.categories.length > 0) result = result.filter((m) => m.categories.some((c) => filters.categories.includes(c)))
    if (filters.pricingTiers.length > 0) result = result.filter((m) => filters.pricingTiers.includes(m.pricingTier))
    if (filters.licenses.length > 0) result = result.filter((m) => filters.licenses.includes(m.license))
    if (filters.minContext) result = result.filter((m) => (m.contextTokens || contextToNumber(m.contextWindow)) >= filters.minContext!)
    if (filters.minMmlu) result = result.filter((m) => m.benchmarks?.mmlu != null && m.benchmarks.mmlu >= filters.minMmlu!)
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'provider': return a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name)
        case 'date': return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        case 'context': return (b.contextTokens || contextToNumber(b.contextWindow)) - (a.contextTokens || contextToNumber(a.contextWindow))
        case 'price': return priceTierOrder[a.pricingTier] - priceTierOrder[b.pricingTier]
        default: return 0
      }
    })
    return result
  }, [filters, showFavOnly, isFav])

  const compareModels = useMemo(() => models.filter((m) => compareSet.has(m.id)), [compareSet])

  const handleModelClick = (model: AIModel) => { setSelectedModel(model); setPage('detail'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const handleBack = () => { setSelectedModel(null); setPage('home') }
  const handleSearch = (value: string) => { setFilters((f) => ({ ...f, search: value })); if (page !== 'home') { setSelectedModel(null); setPage('home') } }
  const handleCompareClick = () => { if (compareSet.size >= 2) setPage('compare') }
  const handleNavigate = (p: AppPage) => { setSelectedModel(null); setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const renderPage = () => {
    switch (page) {
      case 'detail':
        return selectedModel ? (
          <main className="main">
            <ModelDetail model={selectedModel} onBack={handleBack} onModelClick={handleModelClick} isFav={isFav(selectedModel.id)} onToggleFav={toggleFav} />
          </main>
        ) : null
      case 'compare':
        return (
          <main className="main">
            <CompareView models={compareModels} onClose={() => setPage('home')} onRemove={toggleCompare} onModelClick={handleModelClick} />
          </main>
        )
      case 'leaderboard':
        return (
          <main className="main">
            <Leaderboard onBack={handleBack} onModelClick={handleModelClick} />
          </main>
        )
      case 'calculator':
        return (
          <main className="main">
            <CostCalculator onBack={handleBack} />
          </main>
        )
      case 'guides':
        return (
          <main className="main">
            <ComparisonGuides onBack={handleBack} onModelClick={handleModelClick} />
          </main>
        )
      default:
        return (
          <>
            <Hero onModelClick={handleModelClick} onNavigate={handleNavigate} />
            <main className="main">
              <button className="mobile-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                {showFilters ? '✕ Hide Filters' : '☰ Filters & Sort'}
              </button>
              <div className="content-layout">
                <div className={`filters-container ${showFilters ? 'show' : ''}`}>
                  <Filters filters={filters} onChange={setFilters} resultCount={filtered.length} viewMode={viewMode} onViewModeChange={setViewMode} />
                </div>
                {filtered.length === 0 ? (
                  <div className="no-results">
                    <span className="no-results-icon">🔍</span><h3>No models found</h3><p>Try adjusting your search or filters.</p>
                    {showFavOnly && <button className="clear-fav-btn" onClick={() => setShowFavOnly(false)}>Show all models</button>}
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="model-grid">
                    {filtered.map((model) => (
                      <ModelCard key={model.id} model={model} onClick={handleModelClick} isFav={isFav(model.id)} onToggleFav={toggleFav} isCompare={compareSet.has(model.id)} onToggleCompare={toggleCompare} />
                    ))}
                  </div>
                ) : (
                  <ModelTable models={filtered} onClick={handleModelClick} isFav={isFav} onToggleFav={toggleFav} compareSet={compareSet} onToggleCompare={toggleCompare} />
                )}
              </div>
            </main>
          </>
        )
    }
  }

  return (
    <div className="app">
      <Header
        search={filters.search} onSearchChange={handleSearch} darkMode={darkMode}
        onToggleDark={() => setDarkMode(!darkMode)} onLogoClick={handleBack} modelCount={models.length}
        compareCount={compareSet.size} onCompareClick={handleCompareClick} favCount={favCount}
        showFavOnly={showFavOnly} onToggleFav={() => setShowFavOnly(!showFavOnly)}
        onNavigate={handleNavigate} activePage={page}
      />
      {renderPage()}
      <footer className="footer">
        <p>NeuralAtlas — Explore {models.length} models from top AI providers &middot; {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

export default App
