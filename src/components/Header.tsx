import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles, Search, Star, Scale, Sun, Moon, Menu, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import LoginModal from './LoginModal'
import UserMenu from './UserMenu'

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
  const { isAuthenticated } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const search = location.pathname === '/' ? (searchParams.get('search') || '') : ''

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur()
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('neural-atlas-recent-searches')
      if (!raw) return
      const parsed = JSON.parse(raw) as string[]
      if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, 8))
    } catch {
      // Ignore malformed local storage content.
    }
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

  const persistRecentSearch = (value: string) => {
    const normalized = value.trim()
    if (!normalized) return
    const next = [normalized, ...recentSearches.filter((v) => v.toLowerCase() !== normalized.toLowerCase())].slice(0, 8)
    setRecentSearches(next)
    try {
      localStorage.setItem('neural-atlas-recent-searches', JSON.stringify(next))
    } catch {
      // Ignore quota/storage failures.
    }
  }

  const navLinks = [
    { to: '/', label: 'Models', title: 'Browse all AI models' },
    { to: '/leaderboard', label: 'Leaderboard', title: 'Top performing models' },
    { to: '/calculator', label: 'Pricing', title: 'Cost comparison calculator' },
    { to: '/guides', label: 'Guides', title: 'Comparison guides and tutorials' },
    { to: '/analytics', label: 'Analytics', title: 'Market trends and insights' },
  ]

  return (
    <header className="header">
      <div className="header-brand">
        <Link to="/" className="logo" title="Go to NeuralAtlas homepage">
          <span className="logo-icon"><Sparkles size={20} aria-hidden="true" /></span>
          <span className="logo-text">NeuralAtlas</span>
          <span className="brand-tag">AI Model Directory</span>
        </Link>
      </div>

      <nav className="header-nav" role="navigation" aria-label="Main navigation">
        {navLinks.map(({ to, label, title }) => (
          <Link key={to} to={to} className={`nav-link ${isActive(to) ? 'active' : ''}`} aria-current={isActive(to) ? 'page' : undefined} title={title}>{label}</Link>
        ))}
      </nav>

      <div className="header-search" role="search">
        <span className="search-icon" aria-hidden="true"><Search size={16} /></span>
        <input
          ref={inputRef}
          type="text"
          placeholder={`Search ${modelCount} models... (⌘K)`}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          onBlur={(e) => persistRecentSearch(e.target.value)}
          className="search-input"
          aria-label={`Search ${modelCount} models`}
          list="recent-searches"
        />
        {recentSearches.length > 0 && (
          <datalist id="recent-searches">
            {recentSearches.map((entry) => <option key={entry} value={entry} />)}
          </datalist>
        )}
        {search ? (
          <button className="search-clear" onClick={() => handleSearch('')} aria-label="Clear search" title="Clear search"><X size={14} aria-hidden="true" /></button>
        ) : (
          <kbd className="search-kbd" title="Press ⌘K to search">⌘K</kbd>
        )}
      </div>

      <div className="header-actions">
        <button
          className={`header-btn fav-toggle-btn ${showFavOnly ? 'active' : ''}`}
          onClick={onToggleFav}
          aria-label={showFavOnly ? 'Show all models' : 'Show only favorites'}
          title={showFavOnly ? 'Show all models' : `Show favorites (${favCount})`}
        >
          <Star size={18} fill={showFavOnly ? 'currentColor' : 'none'} aria-hidden="true" />
          {favCount > 0 && <span className="header-badge">{favCount}</span>}
        </button>
        <button
          className={`header-btn compare-btn ${compareCount > 0 ? 'has-items' : ''}`}
          onClick={onCompareClick}
          disabled={compareCount < 2}
          aria-label={compareCount < 2 ? 'Select 2+ models to compare' : `Compare ${compareCount} models`}
          title={compareCount < 2 ? 'Select 2+ models to compare' : `Compare ${compareCount} models`}
        >
          <Scale size={18} aria-hidden="true" />
          <span className="header-btn-label">Compare</span>
          {compareCount > 0 && <span className="header-badge">{compareCount}</span>}
        </button>
        <button className="header-btn theme-toggle" onClick={onToggleDark} aria-label={`Switch to ${darkMode ? 'light' : 'dark'} theme`} title={`Switch to ${darkMode ? 'light' : 'dark'} theme`}>
          {darkMode ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </button>
        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <button className="header-btn signin-btn" onClick={() => setShowLogin(true)} title="Sign in to save favorites and comparisons">
            Sign In
          </button>
        )}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          title={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="mobile-nav-overlay" onClick={closeMenu} aria-hidden="true" />
          <nav className="mobile-nav-links" role="navigation" aria-label="Mobile navigation">
            {navLinks.map(({ to, label, title }) => (
              <Link
                key={to}
                to={to}
                className={`mobile-nav-link ${isActive(to) ? 'active' : ''}`}
                onClick={closeMenu}
                aria-current={isActive(to) ? 'page' : undefined}
                title={title}
              >
                {label}
              </Link>
            ))}
          </nav>
        </>
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </header>
  )
}
