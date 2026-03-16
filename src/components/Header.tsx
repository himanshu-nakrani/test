import { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

interface HeaderProps {
  darkMode: boolean
  onToggleDark: () => void
  modelCount: number
  compareCount: number
  onCompareClick: () => void
  favCount: number
  showFavOnly: boolean
  onToggleFav: () => void
}

export default function Header({
  darkMode,
  onToggleDark,
  modelCount,
  compareCount,
  onCompareClick,
  favCount,
  showFavOnly,
  onToggleFav,
}: HeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const search = location.pathname === '/' ? (searchParams.get('search') || '') : ''

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') inputRef.current?.blur()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleSearch = (value: string) => {
    if (location.pathname !== '/') {
      navigate(value ? `/?search=${encodeURIComponent(value)}` : '/')
    } else {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
      params.delete('page')
      setSearchParams(params, { replace: true })
    }
  }

  return (
    <header className="header">
      <Link to="/" className="logo">
        <span className="logo-icon">🤖</span>
        <span className="logo-text">NeuralAtlas</span>
      </Link>

      <nav className="header-nav">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Models</Link>
        <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}>Leaderboard</Link>
        <Link to="/calculator" className={`nav-link ${isActive('/calculator') ? 'active' : ''}`}>Pricing</Link>
        <Link to="/guides" className={`nav-link ${isActive('/guides') ? 'active' : ''}`}>Guides</Link>
      </nav>

      <div className="header-search">
        <span className="search-icon">🔍</span>
        <input
          ref={inputRef}
          type="text"
          placeholder={`Search ${modelCount} models...`}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
        {search ? (
          <button className="search-clear" onClick={() => handleSearch('')}>✕</button>
        ) : (
          <kbd className="search-kbd">⌘K</kbd>
        )}
      </div>

      <div className="header-actions">
        <button
          className={`header-btn fav-toggle-btn ${showFavOnly ? 'active' : ''}`}
          onClick={onToggleFav}
          title="Show favorites"
        >
          {showFavOnly ? '★' : '☆'}
          {favCount > 0 && <span className="header-badge">{favCount}</span>}
        </button>
        <button
          className={`header-btn compare-btn ${compareCount > 0 ? 'has-items' : ''}`}
          onClick={onCompareClick}
          disabled={compareCount < 2}
          title={compareCount < 2 ? 'Select 2+ models to compare' : `Compare ${compareCount} models`}
        >
          ⚖️{compareCount > 0 && <span className="header-badge">{compareCount}</span>}
        </button>
        <button className="header-btn theme-toggle" onClick={onToggleDark} aria-label="Toggle theme">
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
