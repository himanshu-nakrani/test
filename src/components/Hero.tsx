import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Flame, Clock, MessageSquare, Code, Brain, Eye, Image, Music, Layers, Video, Trophy, DollarSign } from 'lucide-react'
import type { AIModel } from '../types'
import { models, allProviders } from '../data/models'

const categoryPills = [
  { key: 'chat', label: 'Chat', icon: <MessageSquare size={14} aria-hidden="true" />, description: 'Conversational AI assistants' },
  { key: 'code', label: 'Code', icon: <Code size={14} aria-hidden="true" />, description: 'Code generation & analysis' },
  { key: 'reasoning', label: 'Reasoning', icon: <Brain size={14} aria-hidden="true" />, description: 'Complex reasoning tasks' },
  { key: 'vision', label: 'Vision', icon: <Eye size={14} aria-hidden="true" />, description: 'Image & vision understanding' },
  { key: 'image', label: 'Image', icon: <Image size={14} aria-hidden="true" />, description: 'Image generation' },
  { key: 'audio', label: 'Audio', icon: <Music size={14} aria-hidden="true" />, description: 'Audio processing' },
  { key: 'embedding', label: 'Embedding', icon: <Layers size={14} aria-hidden="true" />, description: 'Embeddings & retrieval' },
  { key: 'video', label: 'Video', icon: <Video size={14} aria-hidden="true" />, description: 'Video understanding' },
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
        <motion.div
          className="hero-eyebrow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Sparkles size={16} aria-hidden="true" /> Navigate the AI landscape
        </motion.div>
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="gradient-text">NeuralAtlas</span> — The AI Models Directory
        </motion.h1>
        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Explore, compare, and discover {models.length} AI models from {allProviders.length} providers.
          Find the perfect model for your project with benchmarks, pricing, and code snippets.
        </motion.p>
        <motion.div
          className="hero-stats hero-metrics-grid"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="stat metric-card"><AnimatedNumber target={models.length} /><span className="stat-label">Models</span></div>
          <div className="stat metric-card"><AnimatedNumber target={allProviders.length} /><span className="stat-label">Providers</span></div>
          <div className="stat metric-card"><AnimatedNumber target={openCount} /><span className="stat-label">Open Models</span></div>
          <div className="stat metric-card">
            <span className="stat-value stat-value-sm">{models.filter((m) => m.benchmarks).length}</span>
            <span className="stat-label">Benchmarked</span>
          </div>
        </motion.div>

        <motion.div
          className="hero-category-pills"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          role="group"
          aria-label="Quick filter by use case"
        >
          {categoryPills.map((c) => (
            <button
              key={c.key}
              className="hero-category-pill"
              onClick={() => navigate(`/?categories=${c.key}`)}
              aria-label={`${c.label}: ${c.description}`}
              title={c.description}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          className="hero-quick-links"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link to="/find-model" className="hero-link hero-cta-primary"><Sparkles size={16} aria-hidden="true" /> Find Best Model</Link>
          <Link to="/leaderboard" className="hero-link"><Trophy size={16} aria-hidden="true" /> Leaderboard</Link>
          <Link to="/calculator" className="hero-link"><DollarSign size={16} aria-hidden="true" /> Cost Calculator</Link>
        </motion.div>
      </div>

      <motion.div
        className="hero-showcase"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="showcase-col">
          <h3 className="showcase-title"><Flame size={16} aria-hidden="true" /> Featured</h3>
          <div className="showcase-list" role="list">
            {featured.map((m) => (
              <button key={m.id} className="showcase-item" onClick={() => onModelClick(m)} role="listitem" aria-label={`View details for ${m.name} by ${m.provider}`}>
                <span className="provider-dot" style={{ background: m.providerColor }} aria-hidden="true" />
                <span className="showcase-name">{m.name}</span>
                <span className="showcase-provider">{m.provider}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="showcase-col">
          <h3 className="showcase-title"><Clock size={16} aria-hidden="true" /> Recently Released</h3>
          <div className="showcase-list" role="list">
            {recent.map((m) => (
              <button key={m.id} className="showcase-item" onClick={() => onModelClick(m)} role="listitem" aria-label={`View details for ${m.name} by ${m.provider}`}>
                <span className="provider-dot" style={{ background: m.providerColor }} aria-hidden="true" />
                <span className="showcase-name">{m.name}</span>
                <span className="showcase-provider">{m.provider}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
