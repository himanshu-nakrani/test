import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { AIModel } from '../types'
import { models, allProviders } from '../data/models'

const categoryPills = [
  { key: 'chat', label: '💬 Chat' },
  { key: 'code', label: '💻 Code' },
  { key: 'reasoning', label: '🧠 Reasoning' },
  { key: 'vision', label: '👁️ Vision' },
  { key: 'image', label: '🎨 Image' },
  { key: 'audio', label: '🎵 Audio' },
  { key: 'embedding', label: '📐 Embedding' },
  { key: 'video', label: '🎬 Video' },
] as const

function AnimatedNumber({ target }: { target: number }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const duration = 800
    const start = performance.now()
    let raf: number
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setValue(Math.round((1 - Math.pow(1 - progress, 3)) * target))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { raf = requestAnimationFrame(step); observer.disconnect() } },
      { threshold: 0.3 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => { cancelAnimationFrame(raf); observer.disconnect() }
  }, [target])
  return <span ref={ref} className="stat-value">{value}</span>
}

export default function Hero({
  onModelClick,
}: {
  onModelClick: (m: AIModel) => void
}) {
  const navigate = useNavigate()
  const openCount = models.filter((m) => m.license !== 'proprietary').length
  const recent = [...models].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()).slice(0, 5)
  const featured = models.filter((m) => m.isFeatured).slice(0, 5)

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-eyebrow">✨ Navigate the AI landscape</div>
        <h1 className="hero-title">
          <span className="gradient-text">NeuralAtlas</span> — The AI Models Directory
        </h1>
        <p className="hero-subtitle">
          Explore, compare, and discover {models.length} AI models from {allProviders.length} providers.
          Find the perfect model for your project with benchmarks, pricing, and code snippets.
        </p>
        <div className="hero-stats">
          <div className="stat"><AnimatedNumber target={models.length} /><span className="stat-label">Models</span></div>
          <div className="stat-divider" />
          <div className="stat"><AnimatedNumber target={allProviders.length} /><span className="stat-label">Providers</span></div>
          <div className="stat-divider" />
          <div className="stat"><AnimatedNumber target={openCount} /><span className="stat-label">Open Models</span></div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value stat-value-sm">{models.filter((m) => m.benchmarks).length}</span>
            <span className="stat-label">Benchmarked</span>
          </div>
        </div>

        <div className="hero-category-pills">
          {categoryPills.map((c) => (
            <button
              key={c.key}
              className="hero-category-pill"
              onClick={() => navigate(`/?categories=${c.key}`)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="hero-quick-links">
          <Link to="/leaderboard" className="hero-link">🏆 Leaderboard</Link>
          <Link to="/calculator" className="hero-link">💰 Cost Calculator</Link>
        </div>
      </div>

      <div className="hero-showcase">
        <div className="showcase-col">
          <h3 className="showcase-title">🔥 Featured</h3>
          <div className="showcase-list">
            {featured.map((m) => (
              <button key={m.id} className="showcase-item" onClick={() => onModelClick(m)}>
                <span className="provider-dot" style={{ background: m.providerColor }} />
                <span className="showcase-name">{m.name}</span>
                <span className="showcase-provider">{m.provider}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="showcase-col">
          <h3 className="showcase-title">🆕 Recently Released</h3>
          <div className="showcase-list">
            {recent.map((m) => (
              <button key={m.id} className="showcase-item" onClick={() => onModelClick(m)}>
                <span className="provider-dot" style={{ background: m.providerColor }} />
                <span className="showcase-name">{m.name}</span>
                <span className="showcase-provider">{m.provider}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
