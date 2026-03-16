import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import type { AIModel } from '../types'
import { models } from '../data/models'
import { usePageTitle } from '../hooks/usePageTitle'

const BENCHMARKS = [
  { key: 'mmlu', label: 'MMLU', max: 100, description: 'Massive Multitask Language Understanding' },
  { key: 'humanEval', label: 'HumanEval', max: 100, description: 'Code generation benchmark' },
  { key: 'gsm8k', label: 'GSM8K', max: 100, description: 'Grade school math problems' },
  { key: 'mtBench', label: 'MT-Bench', max: 10, description: 'Multi-turn conversation quality' },
] as const

type BenchmarkKey = (typeof BENCHMARKS)[number]['key']

export default function Leaderboard() {
  const navigate = useNavigate()
  const [activeBenchmark, setActiveBenchmark] = useState<BenchmarkKey>('mmlu')

  usePageTitle('Leaderboard')

  const benchInfo = BENCHMARKS.find((b) => b.key === activeBenchmark)!

  const ranked = useMemo(() => {
    return models
      .filter((m) => m.benchmarks?.[activeBenchmark] != null)
      .sort(
        (a, b) =>
          (b.benchmarks![activeBenchmark]! - a.benchmarks![activeBenchmark]!),
      )
  }, [activeBenchmark])

  const maxScore = benchInfo.max

  const handleModelClick = (m: AIModel) => {
    navigate(`/models/${m.id}`)
  }

  return (
    <div className="leaderboard-page">
      <Link to="/" className="back-btn">
        ← Back to models
      </Link>

      <div className="lb-hero">
        <h1>🏆 AI Model Leaderboard</h1>
        <p>Compare models by benchmark performance. Click a model to view details.</p>
      </div>

      <div className="lb-tabs">
        {BENCHMARKS.map((b) => (
          <button
            key={b.key}
            className={`lb-tab ${activeBenchmark === b.key ? 'active' : ''}`}
            onClick={() => setActiveBenchmark(b.key)}
          >
            {b.label}
          </button>
        ))}
      </div>

      <p className="lb-description">{benchInfo.description}</p>

      <div className="lb-chart">
        {ranked.map((m, i) => {
          const score = m.benchmarks![activeBenchmark]!
          const pct = (score / maxScore) * 100

          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <button
                className="lb-row"
                onClick={() => handleModelClick(m)}
              >
                <span className="lb-rank">#{i + 1}</span>
                <div className="lb-model-info">
                  <span className="lb-model-name">{m.name}</span>
                  <span className="lb-model-provider">
                    <span
                      className="provider-dot"
                      style={{ background: m.providerColor }}
                    />
                    {m.provider}
                  </span>
                </div>
                <div className="lb-bar-container">
                  <div
                    className="lb-bar"
                    style={{
                      width: `${pct}%`,
                      background: i === 0
                        ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                        : i === 1
                          ? 'linear-gradient(90deg, #94a3b8, #cbd5e1)'
                          : i === 2
                            ? 'linear-gradient(90deg, #b45309, #d97706)'
                            : 'var(--accent)',
                    }}
                  />
                </div>
                <span className="lb-score">
                  {activeBenchmark === 'mtBench' ? score.toFixed(1) : score.toFixed(1)}
                </span>
              </button>
            </motion.div>
          )
        })}
      </div>

      {ranked.length === 0 && (
        <div className="no-results">
          <p>No benchmark data available for this metric yet.</p>
        </div>
      )}
    </div>
  )
}
