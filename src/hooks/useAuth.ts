import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { createElement } from 'react'

export interface AuthUser {
  id: number
  username: string
  displayName?: string
  avatarUrl?: string
}

export interface AuthContextType {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const TOKEN_KEY = 'neural-atlas-token'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  })
  const [loading, setLoading] = useState(!!token)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid token')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setUser(data)
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null)
          setToken(null)
          try { localStorage.removeItem(TOKEN_KEY) } catch { /* noop */ }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [token])

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.detail || 'Login failed')
    }
    const data = await res.json()
    const newToken = data.access_token ?? data.token
    if (!newToken) throw new Error('No token returned')
    try { localStorage.setItem(TOKEN_KEY, newToken) } catch { /* noop */ }
    setToken(newToken)
    setUser(data.user ?? { id: data.id ?? 0, username: data.username ?? username })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    try { localStorage.removeItem(TOKEN_KEY) } catch { /* noop */ }
  }, [])

  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }), [user, token, loading, login, logout])

  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
