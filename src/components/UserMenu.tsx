import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return null

  const initials = (user.displayName || user.username).charAt(0).toUpperCase()

  const handleNav = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="user-menu-trigger" onClick={() => setOpen(!open)} aria-label="User menu">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="user-avatar" />
        ) : (
          <span className="user-avatar-initial">{initials}</span>
        )}
        <span className="user-menu-name">{user.displayName || user.username}</span>
      </button>

      {open && (
        <div className="user-menu-dropdown">
          <button className="user-menu-item" onClick={() => handleNav('/workspace')}>
            📁 My Workspace
          </button>
          <button className="user-menu-item" onClick={() => handleNav('/?favorites=true')}>
            ★ My Favorites
          </button>
          <div className="user-menu-divider" />
          <button className="user-menu-item user-menu-signout" onClick={() => { setOpen(false); logout() }}>
            🚪 Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
