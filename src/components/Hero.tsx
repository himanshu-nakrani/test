import { models } from '../data/models'
import { allProviders } from '../data/models'

export default function Hero() {
  const featured = models.filter((m) => m.isFeatured)

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          The Complete
          <span className="gradient-text"> AI Models </span>
          Directory
        </h1>
        <p className="hero-subtitle">
          Explore {models.length} AI models from {allProviders.length} providers.
          Compare capabilities, pricing, and find the perfect model for your project.
        </p>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-value">{models.length}</span>
            <span className="stat-label">Models</span>
          </div>
          <div className="stat">
            <span className="stat-value">{allProviders.length}</span>
            <span className="stat-label">Providers</span>
          </div>
          <div className="stat">
            <span className="stat-value">{featured.length}</span>
            <span className="stat-label">Featured</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {models.filter((m) => m.license !== 'proprietary').length}
            </span>
            <span className="stat-label">Open Models</span>
          </div>
        </div>
      </div>
    </section>
  )
}
