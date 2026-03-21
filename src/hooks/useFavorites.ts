import { useState, useCallback, useEffect, useRef } from 'react'

const STORAGE_KEY = 'neural-atlas-favorites'
const TOKEN_KEY = 'neural-atlas-token'

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveFavorites(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites)
  const hasFetchedServer = useRef(false)

  useEffect(() => {
    const token = getToken()
    if (!token || hasFetchedServer.current) return
    hasFetchedServer.current = true
    fetch('/api/user/favorites', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const serverIds = new Set(data.map((f: { model_id: string }) => f.model_id))
          setFavorites((prev) => {
            const merged = new Set([...prev, ...serverIds])
            saveFavorites(merged)
            return merged
          })
        }
      })
      .catch(() => { /* fallback to localStorage */ })
  }, [])

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      const adding = !next.has(id)
      if (adding) next.add(id)
      else next.delete(id)
      saveFavorites(next)

      const token = getToken()
      if (token) {
        const url = `/api/user/favorites/${id}`
        fetch(url, {
          method: adding ? 'POST' : 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => { /* noop - localStorage is source of truth */ })
      }

      return next
    })
  }, [])

  const isFav = useCallback((id: string) => favorites.has(id), [favorites])

  return { favorites, toggle, isFav, count: favorites.size }
}
