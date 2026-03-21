import { useState, useEffect, useCallback } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Star, Scale, MessageCircle, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'

interface SavedComparison {
  id: number
  name: string
  notes?: string
  model_ids: string[]
  created_at: string
}

interface UserFavorite {
  model_id: string
  created_at: string
}

interface UserReview {
  id: number
  model_id: string
  rating: number
  title: string
  comment: string
  created_at: string
}

export default function Workspace() {
  const { isAuthenticated, token, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  usePageTitle('My Workspace')

  const [comparisons, setComparisons] = useState<SavedComparison[]>([])
  const [favorites, setFavorites] = useState<UserFavorite[]>([])
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [loading, setLoading] = useState(true)

  const [compName, setCompName] = useState('')
  const [compNotes, setCompNotes] = useState('')
  const [compModelIds, setCompModelIds] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const fetchData = useCallback(async () => {
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const [compRes, favRes, revRes] = await Promise.allSettled([
        fetch('/api/user/comparisons', { headers }).then((r) => r.ok ? r.json() : []),
        fetch('/api/user/favorites', { headers }).then((r) => r.ok ? r.json() : []),
        fetch('/api/user/reviews', { headers }).then((r) => r.ok ? r.json() : []),
      ])
      setComparisons(compRes.status === 'fulfilled' ? compRes.value : [])
      setFavorites(favRes.status === 'fulfilled' ? favRes.value : [])
      setReviews(revRes.status === 'fulfilled' ? revRes.value : [])
    } catch { /* noop */ }
    setLoading(false)
  }, [token])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/')
      return
    }
    if (isAuthenticated) fetchData()
  }, [isAuthenticated, authLoading, navigate, fetchData])

  const deleteComparison = async (id: number) => {
    try {
      await fetch(`/api/user/comparisons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setComparisons((prev) => prev.filter((c) => c.id !== id))
    } catch { /* noop */ }
  }

  const handleSaveComparison = async (e: FormEvent) => {
    e.preventDefault()
    if (!compName.trim()) { setSaveError('Name is required.'); return }
    const ids = compModelIds.split(',').map((s) => s.trim()).filter(Boolean)
    if (ids.length < 2) { setSaveError('Enter at least 2 comma-separated model IDs.'); return }
    setSaveError('')
    setSaving(true)
    try {
      const res = await fetch('/api/user/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: compName, notes: compNotes, model_ids: ids }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setCompName('')
      setCompNotes('')
      setCompModelIds('')
      fetchData()
    } catch {
      setSaveError('Failed to save comparison.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return <div className="workspace-loading">Loading...</div>
  }

  return (
    <motion.div
      className="workspace-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="workspace-hero">
        <h1><User size={24} aria-hidden="true" /> Welcome, {user?.displayName || user?.username}</h1>
        <p>Your personal NeuralAtlas dashboard</p>
      </div>

      <div className="workspace-grid">
        {/* Favorites */}
        <div className="workspace-card">
          <h2><Star size={18} aria-hidden="true" /> My Favorites</h2>
          {loading ? <p className="workspace-empty">Loading...</p> : favorites.length === 0 ? (
            <p className="workspace-empty">No favorites yet. Star some models to see them here!</p>
          ) : (
            <ul className="workspace-list">
              {favorites.map((f) => (
                <li key={f.model_id}>
                  <Link to={`/models/${f.model_id}`} className="workspace-list-link">
                    {f.model_id}
                  </Link>
                  <span className="workspace-date">
                    {new Date(f.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Saved Comparisons */}
        <div className="workspace-card">
          <h2><Scale size={18} aria-hidden="true" /> Saved Comparisons</h2>
          {loading ? <p className="workspace-empty">Loading...</p> : comparisons.length === 0 ? (
            <p className="workspace-empty">No saved comparisons yet.</p>
          ) : (
            <ul className="workspace-list">
              {comparisons.map((c) => (
                <li key={c.id} className="workspace-comparison-item">
                  <div className="workspace-comparison-info">
                    <strong>{c.name}</strong>
                    {c.notes && <span className="workspace-notes">{c.notes}</span>}
                    <span className="workspace-date">
                      {c.model_ids.length} models &middot; {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="workspace-comparison-actions">
                    <Link to={`/compare?models=${c.model_ids.join(',')}`} className="workspace-action-btn">
                      View
                    </Link>
                    <button className="workspace-delete-btn" onClick={() => deleteComparison(c.id)}>
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <details className="workspace-save-form-details">
            <summary>Save new comparison</summary>
            {saveError && <div className="login-error">{saveError}</div>}
            <form onSubmit={handleSaveComparison} className="workspace-save-form">
              <div className="login-field">
                <label htmlFor="comp-name">Name</label>
                <input id="comp-name" type="text" value={compName} onChange={(e) => setCompName(e.target.value)} placeholder="My comparison" />
              </div>
              <div className="login-field">
                <label htmlFor="comp-notes">Notes (optional)</label>
                <input id="comp-notes" type="text" value={compNotes} onChange={(e) => setCompNotes(e.target.value)} placeholder="Notes about this comparison" />
              </div>
              <div className="login-field">
                <label htmlFor="comp-models">Model IDs (comma separated)</label>
                <input id="comp-models" type="text" value={compModelIds} onChange={(e) => setCompModelIds(e.target.value)} placeholder="claude-4-opus, gpt-4o" />
              </div>
              <button type="submit" className="login-submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Comparison'}
              </button>
            </form>
          </details>
        </div>

        {/* Reviews */}
        <div className="workspace-card workspace-card-wide">
          <h2><MessageCircle size={18} aria-hidden="true" /> My Reviews</h2>
          {loading ? <p className="workspace-empty">Loading...</p> : reviews.length === 0 ? (
            <p className="workspace-empty">You haven&apos;t written any reviews yet.</p>
          ) : (
            <ul className="workspace-list">
              {reviews.map((r) => (
                <li key={r.id} className="workspace-review-item">
                  <Link to={`/models/${r.model_id}`} className="workspace-list-link">
                    {r.model_id}
                  </Link>
                  <span className="workspace-review-stars">{[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill={s <= r.rating ? 'currentColor' : 'none'} className={s <= r.rating ? 'star-icon filled' : 'star-icon'} aria-hidden="true" />)}</span>
                  <strong>{r.title}</strong>
                  <span className="workspace-date">{new Date(r.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  )
}
