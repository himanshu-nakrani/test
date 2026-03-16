import { useState, useEffect, useCallback } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

interface Review {
  id: number
  user_id: number
  username: string
  model_id: string
  rating: number
  title: string
  comment: string
  created_at: string
}

interface ReviewSectionProps {
  modelId: string
}

function StarRating({ value, onChange, interactive = false }: {
  value: number
  onChange?: (v: number) => void
  interactive?: boolean
}) {
  const [hover, setHover] = useState(0)

  return (
    <span className="star-rating" role="img" aria-label={`${value} stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hover || value) ? 'star-filled' : 'star-empty'} ${interactive ? 'star-interactive' : ''}`}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        >
          ★
        </span>
      ))}
    </span>
  )
}

export default function ReviewSection({ modelId }: ReviewSectionProps) {
  const { isAuthenticated, token, user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchReviews = useCallback(() => {
    fetch(`/api/models/${modelId}/reviews`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [modelId])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !comment.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`/api/models/${modelId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, title, comment }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || 'Failed to submit review')
      }
      setTitle('')
      setComment('')
      setRating(5)
      fetchReviews()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      className="review-section"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
    >
      <div className="review-header">
        <h2>💬 Reviews</h2>
        <div className="review-summary">
          {reviews.length > 0 ? (
            <>
              <StarRating value={Math.round(avgRating)} />
              <span className="review-avg">{avgRating.toFixed(1)}</span>
              <span className="review-count">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </>
          ) : (
            <span className="review-count">No reviews yet</span>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div className="review-form-card">
          <h3>Write a Review</h3>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={handleSubmit} className="review-form">
            <div className="review-form-rating">
              <label>Rating</label>
              <StarRating value={rating} onChange={setRating} interactive />
            </div>
            <div className="login-field">
              <label htmlFor="review-title">Title</label>
              <input
                id="review-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
              />
            </div>
            <div className="login-field">
              <label htmlFor="review-comment">Comment</label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your detailed thoughts..."
                rows={3}
                className="review-textarea"
              />
            </div>
            <button type="submit" className="login-submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="review-loading">Loading reviews...</div>
      ) : reviews.length > 0 ? (
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-card-header">
                <span className="review-author-avatar">
                  {review.username.charAt(0).toUpperCase()}
                </span>
                <div className="review-card-meta">
                  <span className="review-author">
                    {review.username}
                    {user && review.user_id === user.id && <span className="review-you-badge">You</span>}
                  </span>
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <StarRating value={review.rating} />
              </div>
              <h4 className="review-card-title">{review.title}</h4>
              <p className="review-card-comment">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : null}
    </motion.div>
  )
}
