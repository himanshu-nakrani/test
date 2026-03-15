import { useEffect, useRef, useState } from 'react'
import { models, allProviders } from '../data/models'

function AnimatedNumber({ target }: { target: number }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const duration = 800
    const start = performance.now()
    let raf: number

    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(step)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          raf = requestAnimationFrame(step)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )

    if (ref.current) observer.observe(ref.current)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [target])

  return <span ref={ref} className="stat-value">{value}</span>
}

export default function Hero() {
  const openCount = models.filter((m) => m.license !== 'proprietary').length
  const featuredCount = models.filter((m) => m.isFeatured).length

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-eyebrow">✨ Your go-to AI model reference</div>
        <h1 className="hero-title">
          The Complete
          <span className="gradient-text"> AI Models </span>
          Directory
        </h1>
        <p className="hero-subtitle">
          Explore, compare, and discover {models.length} AI models from{' '}
          {allProviders.length} providers. Find the perfect model for your project
          with detailed specs, pricing, and capabilities.
        </p>
        <div className="hero-stats">
          <div className="stat">
            <AnimatedNumber target={models.length} />
            <span className="stat-label">Models</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <AnimatedNumber target={allProviders.length} />
            <span className="stat-label">Providers</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <AnimatedNumber target={featuredCount} />
            <span className="stat-label">Featured</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <AnimatedNumber target={openCount} />
            <span className="stat-label">Open Models</span>
          </div>
        </div>
      </div>
    </section>
  )
}
