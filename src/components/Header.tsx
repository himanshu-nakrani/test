interface HeaderProps {
  search: string
  onSearchChange: (value: string) => void
  darkMode: boolean
  onToggleDark: () => void
  onLogoClick: () => void
  modelCount: number
}

export default function Header({
  search,
  onSearchChange,
  darkMode,
  onToggleDark,
  onLogoClick,
  modelCount,
}: HeaderProps) {
  return (
    <header className="header">
      <button className="logo" onClick={onLogoClick}>
        <span className="logo-icon">🤖</span>
        <span className="logo-text">AI Models Hub</span>
      </button>

      <div className="header-search">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder={`Search ${modelCount} models...`}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        {search && (
          <button className="search-clear" onClick={() => onSearchChange('')}>
            ✕
          </button>
        )}
      </div>

      <div className="header-actions">
        <button
          className="theme-toggle"
          onClick={onToggleDark}
          aria-label="Toggle theme"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
