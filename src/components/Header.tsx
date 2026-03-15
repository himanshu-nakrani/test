import { useEffect, useRef } from 'react'

interface HeaderProps {
  search: string
  onSearchChange: (value: string) => void
  darkMode: boolean
  onToggleDark: () => void
  onLogoClick: () => void
  modelCount: number
  compareCount: number
  onCompareClick: () => void
  favCount: number
  showFavOnly: boolean
  onToggleFav: () => void
}

export default function Header({
  search,
  onSearchChange,
  darkMode,
  onToggleDark,
  onLogoClick,
  modelCount,
  compareCount,
  onCompareClick,
  favCount,
  showFavOnly,
  onToggleFav,
}: HeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

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

  return (
    <header className="header">
      <button className="logo" onClick={onLogoClick}>
        <span className="logo-icon">🤖</span>
        <span className="logo-text">AI Models Hub</span>
      </button>

      <div className="header-search">
        <span className="search-icon">🔍</span>
        <input
          ref={inputRef}
          type="text"
          placeholder={`Search ${modelCount} models...`}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        {search ? (
          <button className="search-clear" onClick={() => onSearchChange('')}>
            ✕
          </button>
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
          title={
            compareCount < 2
              ? 'Select 2+ models to compare'
              : `Compare ${compareCount} models`
          }
        >
          ⚖️
          {compareCount > 0 && (
            <span className="header-badge">{compareCount}</span>
          )}
        </button>

        <button
          className="header-btn theme-toggle"
          onClick={onToggleDark}
          aria-label="Toggle theme"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
