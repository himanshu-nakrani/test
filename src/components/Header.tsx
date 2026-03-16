import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
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

  const navLinks = [
    { to: '/', label: 'Models' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/calculator', label: 'Pricing' },
    { to: '/guides', label: 'Guides' },
    { to: '/analytics', label: 'Analytics' },
  ]

  return (
    <header className="header">
      <Link to="/" className="logo">
        <span className="logo-icon">🤖</span>
        <span className="logo-text">NeuralAtlas</span>
      </Link>

      <nav className="header-nav" role="navigation" aria-label="Main navigation">
        {navLinks.map(({ to, label }) => (
          <Link key={to} to={to} className={`nav-link ${isActive(to) ? 'active' : ''}`} aria-current={isActive(to) ? 'page' : undefined}>{label}</Link>
        ))}
      </nav>

      <div className="header-search" role="search">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          ref={inputRef}
          type="text"
          placeholder={`Search ${modelCount} models...`}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
          aria-label={`Search ${modelCount} models`}
        />
        {search ? (
          <button className="search-clear" onClick={() => handleSearch('')} aria-label="Clear search">✕</button>
        ) : (
          <kbd className="search-kbd">⌘K</kbd>
        )}
      </div>

      <div className="header-actions">
        <button
          className={`header-btn fav-toggle-btn ${showFavOnly ? 'active' : ''}`}
          onClick={onToggleFav}
          aria-label="Show favorites"
          title="Show favorites"
        >
          {showFavOnly ? '★' : '☆'}
          {favCount > 0 && <span className="header-badge">{favCount}</span>}
        </button>
        <button
          className={`header-btn compare-btn ${compareCount > 0 ? 'has-items' : ''}`}
          onClick={onCompareClick}
          disabled={compareCount < 2}
          aria-label={compareCount < 2 ? 'Select 2+ models to compare' : `Compare ${compareCount} models`}
          title={compareCount < 2 ? 'Select 2+ models to compare' : `Compare ${compareCount} models`}
        >
          ⚖️{compareCount > 0 && <span className="header-badge">{compareCount}</span>}
        </button>
        <button className="header-btn theme-toggle" onClick={onToggleDark} aria-label="Toggle theme">
          {darkMode ? '☀️' : '🌙'}
        </button>
        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <button className="header-btn signin-btn" onClick={() => setShowLogin(true)}>
            Sign In
          </button>
        )}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="mobile-nav-overlay" onClick={closeMenu} aria-hidden="true" />
          <nav className="mobile-nav-links" role="navigation" aria-label="Mobile navigation">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`mobile-nav-link ${isActive(to) ? 'active' : ''}`}
                onClick={closeMenu}
                aria-current={isActive(to) ? 'page' : undefined}
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
