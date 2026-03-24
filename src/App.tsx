import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Routes, Route, useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { X, Menu, Search, Scale, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Analytics as VercelAnalytics } from '@vercel/analytics/react'
import type { AIModel, FilterState, ViewMode, ModelCategory, PricingTier, LicenseType } from './types'
import { models } from './data/models'
import { useFavorites } from './hooks/useFavorites'
import { usePageTitle } from './hooks/usePageTitle'
import { AuthProvider } from './hooks/useAuth'
import ErrorBoundary from './components/ErrorBoundary'
import Header from './components/Header'
import Hero from './components/Hero'
import Filters from './components/Filters'
import ModelCard from './components/ModelCard'
import ModelTable from './components/ModelTable'
import ModelDetail from './components/ModelDetail'
import NotFound from './components/NotFound'
import BackToTop from './components/BackToTop'
import LoadingSpinner from './components/LoadingSpinner'
import JsonLd from './components/JsonLd'
import ComparisonTray from './components/ComparisonTray'
import './App.css'

const Leaderboard = lazy(() => import('./components/Leaderboard'))
const CostCalculator = lazy(() => import('./components/CostCalculator'))
const ComparisonGuides = lazy(() => import('./components/ComparisonGuides'))
const CompareView = lazy(() => import('./components/CompareView'))
const Analytics = lazy(() => import('./components/Analytics'))
const Workspace = lazy(() => import('./components/Workspace'))
const Privacy = lazy(() => import('./components/Privacy'))
const Terms = lazy(() => import('./components/Terms'))
const RecommendationWizardPage = lazy(() => import('./components/RecommendationWizardPage'))

const ITEMS_PER_PAGE = 12

const contextToNumber = (ctx: string): number => {
  if (ctx === 'N/A') return 0
  const match = ctx.match(/([\d.]+)\s*(M|K)/i)
  if (!match) return 0
  const num = parseFloat(match[1])
  return match[2].toUpperCase() === 'M' ? num * 1_000_000 : num * 1_000
}

const priceTierOrder: Record<string, number> = { free: 0, low: 1, medium: 2, high: 3, premium: 4 }
const sortOrder: Array<'name' | 'provider' | 'date' | 'context' | 'price'> = ['name', 'provider', 'date', 'context', 'price']

const compareBy = (a: AIModel, b: AIModel, sortBy: 'name' | 'provider' | 'date' | 'context' | 'price' | 'trending') => {
  switch (sortBy) {
    case 'name': return a.name.localeCompare(b.name)
    case 'provider': return a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name)
    case 'date': return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    case 'context': return (b.contextTokens || contextToNumber(b.contextWindow)) - (a.contextTokens || contextToNumber(a.contextWindow))
    case 'price': return priceTierOrder[a.pricingTier] - priceTierOrder[b.pricingTier]
    case 'trending': {
      // Higher recency + benchmark strength + lower cost rises first.
      const ageInDaysA = Math.max(1, Math.floor((Date.now() - new Date(a.releaseDate).getTime()) / (1000 * 60 * 60 * 24)))
      const ageInDaysB = Math.max(1, Math.floor((Date.now() - new Date(b.releaseDate).getTime()) / (1000 * 60 * 60 * 24)))
      const recencyA = 1 / ageInDaysA
      const recencyB = 1 / ageInDaysB
      const benchmarkA = (a.benchmarks?.mmlu || 0) / 100
      const benchmarkB = (b.benchmarks?.mmlu || 0) / 100
      const pricePenaltyA = priceTierOrder[a.pricingTier] / 6
      const pricePenaltyB = priceTierOrder[b.pricingTier] / 6
      const featuredBoostA = a.isFeatured ? 0.15 : 0
      const featuredBoostB = b.isFeatured ? 0.15 : 0
      const scoreA = recencyA * 5 + benchmarkA * 2.5 - pricePenaltyA + featuredBoostA
      const scoreB = recencyB * 5 + benchmarkB * 2.5 - pricePenaltyB + featuredBoostB
      return scoreB - scoreA
    }
    default: return 0
  }
}

function parseFiltersFromParams(params: URLSearchParams): FilterState {
  const secondarySort = params.get('secondarySort') as FilterState['secondarySortBy'] | null
  return {
    search: params.get('search') || '',
    providers: params.get('providers') ? params.get('providers')!.split(',') : [],
    categories: params.get('categories') ? params.get('categories')!.split(',') as ModelCategory[] : [],
    pricingTiers: params.get('pricing') ? params.get('pricing')!.split(',') as PricingTier[] : [],
    licenses: params.get('licenses') ? params.get('licenses')!.split(',') as LicenseType[] : [],
    sortBy: (params.get('sort') as FilterState['sortBy']) || 'name',
    secondarySortBy: secondarySort || undefined,
    minContext: params.get('minContext') ? +params.get('minContext')! : undefined,
    minMmlu: params.get('minMmlu') ? +params.get('minMmlu')! : undefined,
  }
}

function filtersToParams(filters: FilterState, page: number): Record<string, string> {
  const p: Record<string, string> = {}
  if (filters.search) p.search = filters.search
  if (filters.providers.length) p.providers = filters.providers.join(',')
  if (filters.categories.length) p.categories = filters.categories.join(',')
  if (filters.pricingTiers.length) p.pricing = filters.pricingTiers.join(',')
  if (filters.licenses.length) p.licenses = filters.licenses.join(',')
  if (filters.sortBy !== 'name') p.sort = filters.sortBy
  if (filters.secondarySortBy) p.secondarySort = filters.secondarySortBy
  if (filters.minContext) p.minContext = String(filters.minContext)
  if (filters.minMmlu) p.minMmlu = String(filters.minMmlu)
  if (page > 1) p.page = String(page)
  return p
}

/* ===== Home Page ===== */
function HomePage({
  compareSet,
  toggleCompare,
  showFavOnly,
}: {
  compareSet: Set<string>
  toggleCompare: (id: string) => void
  showFavOnly: boolean
}) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const gridRef = useRef<HTMLDivElement>(null)
  const resultsTopbarRef = useRef<HTMLDivElement>(null)
  const [focusIdx, setFocusIdx] = useState(-1)

  const filters = useMemo(() => parseFiltersFromParams(searchParams), [searchParams])
  const currentPage = +(searchParams.get('page') || '1')

  usePageTitle('')

  const { toggle: toggleFav, isFav } = useFavorites()

  const updateFilters = useCallback((newFilters: FilterState) => {
    setSearchParams(filtersToParams(newFilters, 1), { replace: true })
  }, [setSearchParams])

  const setPage = useCallback((p: number) => {
    setSearchParams(filtersToParams(filters, p), { replace: true })
    requestAnimationFrame(() => {
      resultsTopbarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [filters, setSearchParams])

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
      const primary = compareBy(a, b, filters.sortBy)
      if (primary !== 0) return primary
      if (filters.secondarySortBy) return compareBy(a, b, filters.secondarySortBy)
      const fallback = sortOrder.find((s) => s !== filters.sortBy)
      return fallback ? compareBy(a, b, fallback) : 0
    })
    return result
  }, [filters, showFavOnly, isFav])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedModels = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  const handleModelClick = useCallback((model: AIModel) => {
    navigate(`/models/${model.id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate])

  useEffect(() => {
    if (focusIdx < 0) return
    const cards = gridRef.current?.querySelectorAll('.model-card')
    if (cards && cards[focusIdx]) {
      (cards[focusIdx] as HTMLElement).scrollIntoView({ block: 'nearest' })
    }
  }, [focusIdx])

  const handleGridKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (viewMode !== 'grid' || paginatedModels.length === 0) return
    const cols = Math.max(1, Math.floor((gridRef.current?.clientWidth || 900) / 300))
    let next = focusIdx
    switch (e.key) {
      case 'ArrowRight': next = Math.min(focusIdx + 1, paginatedModels.length - 1); break
      case 'ArrowLeft': next = Math.max(focusIdx - 1, 0); break
      case 'ArrowDown': next = Math.min(focusIdx + cols, paginatedModels.length - 1); break
      case 'ArrowUp': next = Math.max(focusIdx - cols, 0); break
      case 'Enter':
        if (focusIdx >= 0 && focusIdx < paginatedModels.length) handleModelClick(paginatedModels[focusIdx])
        return
      default: return
    }
    e.preventDefault()
    setFocusIdx(next)
  }, [viewMode, focusIdx, paginatedModels, handleModelClick])

  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const maxShow = 5
    let start = Math.max(1, safePage - Math.floor(maxShow / 2))
    const end = Math.min(totalPages, start + maxShow - 1)
    start = Math.max(1, end - maxShow + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [safePage, totalPages])

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "NeuralAtlas",
        "url": "https://test-olive-pi-98.vercel.app",
        "description": "Explore, compare, and discover AI models from top providers.",
      }} />
      <Hero onModelClick={handleModelClick} />
      <main className="main" role="main">
        <button
          className="mobile-filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? <><X size={14} aria-hidden="true" /> Hide Filters</> : <><Menu size={14} aria-hidden="true" /> Filters &amp; Sort</>}
        </button>

        <div className="results-topbar" aria-live="polite" ref={resultsTopbarRef}>
          <div className="results-summary">
            <strong>{filtered.length}</strong> model{filtered.length === 1 ? '' : 's'}
            {filters.search && <span className="results-query">for "{filters.search}"</span>}
          </div>
          <div className="results-status">
            {compareSet.size > 0 && <span className="results-pill">Comparing {compareSet.size}</span>}
            {showFavOnly && <span className="results-pill">Favorites only</span>}
          </div>
        </div>

        {showFilters && (
          <div className="mobile-filter-backdrop" onClick={() => setShowFilters(false)} />
        )}

        <div className="content-layout">
          <div className={`filters-container ${showFilters ? 'show' : ''}`}>
            <button className="mobile-filter-close" onClick={() => setShowFilters(false)}><X size={14} aria-hidden="true" /> Close</button>
            <Filters
              filters={filters}
              onChange={updateFilters}
              resultCount={filtered.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="no-results">
              <span className="no-results-icon"><Search size={24} aria-hidden="true" /></span><h3>No models found</h3><p>Try adjusting your search or filters.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <>
              <div>
                <div
                  className="model-grid"
                  ref={gridRef}
                  tabIndex={0}
                  onKeyDown={handleGridKeyDown}
                  role="grid"
                  aria-label="Model cards"
                >
                  {paginatedModels.map((model, idx) => (
                    <div key={model.id} className={focusIdx === idx ? 'grid-card-focused' : ''}>
                      <ModelCard
                        model={model}
                        onClick={handleModelClick}
                        isFav={isFav(model.id)}
                        onToggleFav={toggleFav}
                        isCompare={compareSet.has(model.id)}
                        onToggleCompare={toggleCompare}
                        searchQuery={filters.search}
                        index={idx}
                      />
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      disabled={safePage <= 1}
                      onClick={() => setPage(safePage - 1)}
                    >
                      <ChevronLeft size={14} aria-hidden="true" /> Previous
                    </button>
                    <div className="pagination-pages">
                      {pageNumbers.map((p) => (
                        <button
                          key={p}
                          className={`pagination-page ${p === safePage ? 'active' : ''}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <button
                      className="pagination-btn"
                      disabled={safePage >= totalPages}
                      onClick={() => setPage(safePage + 1)}
                    >
                      Next <ChevronRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <ModelTable
              models={filtered}
              onClick={handleModelClick}
              isFav={isFav}
              onToggleFav={toggleFav}
              compareSet={compareSet}
              onToggleCompare={toggleCompare}
            />
          )}
        </div>
      </main>
    </>
  )
}

/* ===== Model Detail Page Wrapper ===== */
function ModelDetailPage() {
  const { id } = useParams()
  const { isFav, toggle: toggleFav } = useFavorites()

  const model = models.find((m) => m.id === id)

  if (!model) {
    return <NotFound />
  }

  return (
    <motion.main
      className="main"
      role="main"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": model.name,
        "applicationCategory": "AI Model",
        "description": model.description,
        "offers": { "@type": "Offer", "price": model.pricing.input },
        "author": { "@type": "Organization", "name": model.provider },
      }} />
      <ModelDetail
        model={model}
        isFav={isFav(model.id)}
        onToggleFav={toggleFav}
      />
    </motion.main>
  )
}

/* ===== Compare Page ===== */
function ComparePage({
  compareSet,
  toggleCompare,
}: {
  compareSet: Set<string>
  toggleCompare: (id: string) => void
}) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const modelIdsFromUrl = searchParams.get('models')?.split(',').filter(Boolean) || []
  const urlModels = modelIdsFromUrl.map((id) => models.find((m) => m.id === id)).filter(Boolean) as AIModel[]

  const compareModels = useMemo(() => {
    if (urlModels.length >= 2) return urlModels
    return models.filter((m) => compareSet.has(m.id))
  }, [urlModels, compareSet])

  if (compareModels.length < 2) {
    return (
      <motion.main
        className="main"
        role="main"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="no-results">
          <span className="no-results-icon"><Scale size={24} aria-hidden="true" /></span>
          <h3>Not enough models to compare</h3>
          <p>Select at least 2 models from the home page, or provide model IDs via URL query.</p>
          <button className="back-btn" onClick={() => navigate('/')}><ArrowLeft size={16} aria-hidden="true" /> Back to models</button>
        </div>
      </motion.main>
    )
  }

  return (
    <motion.main
      className="main"
      role="main"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <CompareView
          models={compareModels}
          onRemove={toggleCompare}
        />
      </Suspense>
    </motion.main>
  )
}

/* ===== App Root ===== */
function App() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('neural-atlas-theme')
      if (stored !== null) {
        return stored === 'dark'
      }
      // No stored preference, detect from system
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      // Fallback to system preference if localStorage fails
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  })
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set())
  const [showFavOnly, setShowFavOnly] = useState(false)
  const navigate = useNavigate()

  const { count: favCount } = useFavorites()

  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('neural-atlas-theme', theme) } catch { /* noop */ }
  }, [darkMode])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const stored = localStorage.getItem('neural-atlas-theme')
        if (stored === null) {
          setDarkMode(e.matches)
        }
      } catch {
        // Ignore storage errors
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleCompare = useCallback((id: string) => {
    setCompareSet((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }, [])

  const handleCompareClick = useCallback(() => {
    if (compareSet.size >= 2) {
      const ids = [...compareSet].join(',')
      navigate(`/compare?models=${ids}`)
    }
  }, [compareSet, navigate])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="app container-fluid px-0">
          <a href="#main-content" className="skip-to-content">Skip to content</a>
          <Header
            darkMode={darkMode}
            onToggleDark={() => setDarkMode(!darkMode)} modelCount={models.length}
        compareCount={compareSet.size} onCompareClick={handleCompareClick} favCount={favCount}
        showFavOnly={showFavOnly} onToggleFav={() => setShowFavOnly(!showFavOnly)}
      />
      <ComparisonTray 
        compareCount={compareSet.size} 
        onCompareClick={handleCompareClick}
        onClear={() => setCompareSet(new Set())}
      />
      <div id="main-content">
        <Routes>
          <Route path="/" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HomePage
                compareSet={compareSet}
                toggleCompare={toggleCompare}
                showFavOnly={showFavOnly}
              />
            </motion.div>
          } />
          <Route path="/models/:id" element={
            <ModelDetailPage />
          } />
          <Route path="/leaderboard" element={
            <motion.main className="main" role="main" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <Suspense fallback={<LoadingSpinner />}>
                <Leaderboard />
              </Suspense>
            </motion.main>
          } />
          <Route path="/calculator" element={
            <motion.main className="main" role="main" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <Suspense fallback={<LoadingSpinner />}>
                <CostCalculator />
              </Suspense>
            </motion.main>
          } />
          <Route path="/guides" element={
            <motion.main className="main" role="main" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <Suspense fallback={<LoadingSpinner />}>
                <ComparisonGuides />
              </Suspense>
            </motion.main>
          } />
          <Route path="/guides/:id" element={
            <motion.main className="main" role="main" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <Suspense fallback={<LoadingSpinner />}>
                <ComparisonGuides />
              </Suspense>
            </motion.main>
          } />
          <Route path="/find-model" element={
            <Suspense fallback={<LoadingSpinner />}>
              <RecommendationWizardPage />
            </Suspense>
          } />
          <Route path="/analytics" element={
            <motion.main className="main" role="main" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <Suspense fallback={<LoadingSpinner />}>
                <Analytics />
              </Suspense>
            </motion.main>
          } />
          <Route path="/compare" element={
            <ComparePage
              compareSet={compareSet}
              toggleCompare={toggleCompare}
            />
          } />
          <Route path="/workspace" element={
            <motion.main className="main" role="main" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <Suspense fallback={<LoadingSpinner />}>
                <Workspace />
              </Suspense>
            </motion.main>
          } />
          <Route path="/privacy" element={
            <motion.main className="main" role="main" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <Suspense fallback={<LoadingSpinner />}>
                <Privacy />
              </Suspense>
            </motion.main>
          } />
          <Route path="/terms" element={
            <motion.main className="main" role="main" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <Suspense fallback={<LoadingSpinner />}>
                <Terms />
              </Suspense>
            </motion.main>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <footer className="footer">
        <p>NeuralAtlas — Explore {models.length} models from top AI providers &middot; {new Date().getFullYear()} &middot; <Link to="/privacy">Privacy</Link> &middot; <Link to="/terms">Terms</Link></p>
      </footer>
      <BackToTop />
      <VercelAnalytics />
    </div>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
