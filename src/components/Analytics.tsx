import { Link } from 'react-router-dom'
import { BarChart3, ArrowLeft } from 'lucide-react'
import { models } from '../data/models'
import { usePageTitle } from '../hooks/usePageTitle'
import ScatterPlot from './ScatterPlot'
import Timeline from './Timeline'

export default function Analytics() {
  usePageTitle('Analytics')

  return (
    <div className="analytics-page">
      <Link to="/" className="back-btn"><ArrowLeft size={16} aria-hidden="true" /> Back to models</Link>

      <div className="analytics-hero">
        <h1><BarChart3 size={24} aria-hidden="true" /> Analytics & Insights</h1>
        <p>Visualize AI model trends, pricing patterns, and performance benchmarks across the industry.</p>
      </div>

      <section className="analytics-section">
        <h2>Price vs Performance</h2>
        <p className="analytics-section-desc">
          See how input pricing relates to MMLU benchmark scores. Click any data point to view the model.
        </p>
        <ScatterPlot models={models} />
      </section>

      <section className="analytics-section">
        <h2>Model Release Timeline</h2>
        <p className="analytics-section-desc">
          Track when models were released across providers. Hover to see details, click to explore.
        </p>
        <Timeline models={models} />
      </section>
    </div>
  )
}
