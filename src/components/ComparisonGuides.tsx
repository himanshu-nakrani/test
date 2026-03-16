import { Link, useNavigate, useParams } from 'react-router-dom'
import { BookOpen, ArrowRight, Award, ArrowLeft } from 'lucide-react'
import type { AIModel } from '../types'
import { comparisonGuides } from '../data/comparisons'
import { models } from '../data/models'
import { usePageTitle } from '../hooks/usePageTitle'

function GuideDetail({ guideId }: { guideId: string }) {
  const navigate = useNavigate()
  const guide = comparisonGuides.find((g) => g.id === guideId)

  usePageTitle(guide ? guide.title : 'Guide Not Found')

  if (!guide) {
    return (
      <div className="guides-page page-transition">
        <Link to="/guides" className="back-btn"><ArrowLeft size={16} aria-hidden="true" /> Back to guides</Link>
        <div className="no-results">
          <h3>Guide not found</h3>
          <p>This comparison guide doesn't exist.</p>
        </div>
      </div>
    )
  }

  const [m1, m2] = guide.modelIds.map((id) => models.find((m) => m.id === id)!)

  const handleModelClick = (m: AIModel) => {
    navigate(`/models/${m.id}`)
  }

  return (
    <div className="guides-page page-transition">
      <Link to="/guides" className="back-btn"><ArrowLeft size={16} aria-hidden="true" /> Back to guides</Link>
      <div className="guide-detail">
        <h1 className="guide-title">{guide.title}</h1>
        <p className="guide-subtitle">{guide.subtitle}</p>

        <div className="guide-models-bar">
          {[m1, m2].filter(Boolean).map((m) => (
            <button key={m.id} className="guide-model-chip" onClick={() => handleModelClick(m)}>
              <span className="provider-dot" style={{ background: m.providerColor }} />
              {m.name} <span className="guide-chip-arrow"><ArrowRight size={14} aria-hidden="true" /></span>
            </button>
          ))}
        </div>

        {guide.sections.map((s) => (
          <div key={s.heading} className="guide-section">
            <h3>{s.heading}</h3>
            <p>{s.content}</p>
          </div>
        ))}

        <div className="guide-verdict">
          <h3><Award size={18} className="section-icon" aria-hidden="true" /> Verdict</h3>
          <p>{guide.verdict}</p>
        </div>
      </div>
    </div>
  )
}

function GuidesList() {
  usePageTitle('Comparison Guides')

  return (
    <div className="guides-page page-transition">
      <Link to="/" className="back-btn"><ArrowLeft size={16} aria-hidden="true" /> Back to models</Link>
      <div className="guides-hero">
        <h1><BookOpen size={24} aria-hidden="true" /> Comparison Guides</h1>
        <p>In-depth comparisons of the most popular AI models to help you choose.</p>
      </div>
      <div className="guides-grid">
        {comparisonGuides.map((g) => (
          <Link key={g.id} to={`/guides/${g.id}`} className="guide-card">
            <h3>{g.title}</h3>
            <p>{g.subtitle}</p>
            <span className="guide-read-more">Read comparison <ArrowRight size={14} aria-hidden="true" /></span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function ComparisonGuides() {
  const { id } = useParams()

  if (id) {
    return <GuideDetail guideId={id} />
  }

  return <GuidesList />
}
