import { Link } from 'react-router-dom'
import { BarChart3, ArrowLeft } from 'lucide-react'
import { models } from '../data/models'
import type { AIModel, ModelCategory } from '../types'
import { usePageTitle } from '../hooks/usePageTitle'
import ScatterPlot from './ScatterPlot'
import Timeline from './Timeline'

const categoryLabels: Record<ModelCategory, string> = {
  chat: 'Chat',
  reasoning: 'Reasoning',
  code: 'Code',
  vision: 'Vision',
  embedding: 'Embedding',
  image: 'Image',
  audio: 'Audio',
  video: 'Video',
}

const categoryKeys = Object.keys(categoryLabels) as ModelCategory[]

const toNumber = (value?: string) => {
  if (!value) return 0
  const n = Number.parseFloat(value.replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

const capabilityScore = (model: AIModel) => {
  const bench = model.benchmarks || {}
  const benchValues = [bench.mmlu, bench.gsm8k, bench.arc, bench.hellaswag, bench.humanEval, bench.mtBench].filter((v): v is number => typeof v === 'number')
  const benchAvg = benchValues.length ? benchValues.reduce((acc, v) => acc + v, 0) / benchValues.length : 0
  const categoryCoverage = model.categories.length / categoryKeys.length
  const contextNorm = Math.min(1, (model.contextTokens || 0) / 1_000_000)
  return benchAvg * 0.7 + categoryCoverage * 20 + contextNorm * 10
}

const valueScore = (model: AIModel) => {
  const capability = capabilityScore(model)
  const input = model.pricing.inputPerMillion || toNumber(model.pricing.input)
  const output = model.pricing.outputPerMillion || toNumber(model.pricing.output)
  const blendedCost = input * 0.4 + output * 0.6
  if (model.pricing.free || blendedCost <= 0) return capability
  return capability / Math.max(1, blendedCost)
}

export default function Analytics() {
  usePageTitle('Analytics')
  const topCapability = [...models].sort((a, b) => capabilityScore(b) - capabilityScore(a)).slice(0, 8)
  const topValue = [...models].sort((a, b) => valueScore(b) - valueScore(a)).slice(0, 6)

  const useCaseRecommendations = categoryKeys
    .map((cat) => {
      const matching = models.filter((m) => m.categories.includes(cat))
      if (matching.length === 0) return null
      const best = [...matching].sort((a, b) => valueScore(b) - valueScore(a))[0]
      return { category: cat, model: best }
    })
    .filter((item): item is { category: ModelCategory; model: AIModel } => Boolean(item))

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

      <section className="analytics-section">
        <h2>Capability Score Breakdown</h2>
        <p className="analytics-section-desc">
          Composite score from benchmarks, category breadth, and context capacity.
        </p>
        <div className="insights-list">
          {topCapability.map((model) => {
            const score = capabilityScore(model)
            return (
              <Link key={model.id} to={`/models/${model.id}`} className="insight-row">
                <div className="insight-row-main">
                  <strong>{model.name}</strong>
                  <span>{model.provider}</span>
                </div>
                <div className="insight-bar-bg">
                  <div className="insight-bar" style={{ width: `${Math.min(100, score)}%` }} />
                </div>
                <span className="insight-score">{score.toFixed(1)}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="analytics-section">
        <h2>Best Value Recommendations</h2>
        <p className="analytics-section-desc">
          Ranked by capability-per-cost using published benchmark and pricing signals.
        </p>
        <div className="recommend-grid">
          {topValue.map((model) => (
            <Link key={model.id} to={`/models/${model.id}`} className="recommend-card">
              <h3>{model.name}</h3>
              <p>{model.provider}</p>
              <span className="recommend-score">Value score: {valueScore(model).toFixed(2)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="analytics-section">
        <h2>Best For Use Cases</h2>
        <p className="analytics-section-desc">
          A quick pick per primary capability area.
        </p>
        <div className="usecase-recommendations">
          {useCaseRecommendations.map(({ category, model }) => (
            <Link key={category} to={`/models/${model.id}`} className="usecase-item">
              <strong>{categoryLabels[category]}</strong>
              <span>{model.name}</span>
              <small>{model.provider}</small>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
