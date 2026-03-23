import { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import type { AIModel, BenchmarkScores } from '../types'

interface BenchmarkChartProps {
  models: AIModel[]
  benchmarkName?: keyof BenchmarkScores
}

const BENCHMARK_LABELS: Record<string, { label: string; description: string; max: number }> = {
  mmlu: { label: 'MMLU', description: 'General knowledge', max: 100 },
  humanEval: { label: 'Human Eval', description: 'Code generation', max: 100 },
  gsm8k: { label: 'GSM8K', description: 'Mathematical reasoning', max: 100 },
  mtBench: { label: 'MT-Bench', description: 'Multi-turn conversations', max: 10 },
  arc: { label: 'ARC', description: 'Science questions', max: 100 },
  hellaswag: { label: 'HellaSwag', description: 'Common sense reasoning', max: 100 },
}

export default function BenchmarkChart({
  models,
  benchmarkName = 'mmlu',
}: BenchmarkChartProps) {
  const benchmark = BENCHMARK_LABELS[benchmarkName] || BENCHMARK_LABELS.mmlu
  const maxScore = benchmark.max

  const chartData = useMemo(
    () =>
      models
        .filter((m) => m.benchmarks && m.benchmarks[benchmarkName])
        .map((m) => ({
          name: m.name,
          score: m.benchmarks![benchmarkName] as number,
          provider: m.provider,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10),
    [models, benchmarkName]
  )

  if (chartData.length === 0) {
    return (
      <div className="benchmark-chart">
        <div className="benchmark-header">
          <h3>
            <BarChart3 size={20} aria-hidden="true" /> {benchmark.label} Benchmark
          </h3>
          <p className="benchmark-desc">{benchmark.description}</p>
        </div>
        <div className="benchmark-empty">
          <p>No benchmark data available</p>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...chartData.map((d) => d.score))

  return (
    <div className="benchmark-chart">
      <div className="benchmark-header">
        <h3>
          <BarChart3 size={20} aria-hidden="true" /> {benchmark.label} Benchmark
        </h3>
        <p className="benchmark-desc">{benchmark.description}</p>
      </div>

      <div className="benchmark-bars">
        {chartData.map((item, idx) => {
          const percentage = (item.score / maxValue) * 100
          const barColor = idx === 0 ? 'var(--accent)' : idx === 1 ? 'var(--accent-light)' : 'var(--border-hover)'

          return (
            <div key={item.name} className="benchmark-bar-group">
              <div className="benchmark-label">
                <span className="benchmark-name">{item.name}</span>
                <span className="benchmark-provider">{item.provider}</span>
              </div>

              <div className="benchmark-bar-container">
                <div
                  className="benchmark-bar"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: barColor,
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  role="progressbar"
                  aria-valuenow={Math.round(item.score)}
                  aria-valuemin={0}
                  aria-valuemax={maxScore}
                />
              </div>

              <div className="benchmark-score">
                <span className="score-value">{item.score.toFixed(1)}</span>
                <span className="score-max">/{maxScore}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="benchmark-legend">
        <p className="legend-note">
          Showing top {chartData.length} models. Higher scores indicate better performance.
        </p>
      </div>
    </div>
  )
}
