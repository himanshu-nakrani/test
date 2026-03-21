import type { BenchmarkScores } from '../types'

interface RadarChartProps {
  benchmarks: BenchmarkScores
  size?: number
}

const METRICS = [
  { key: 'mmlu', label: 'MMLU', max: 100 },
  { key: 'humanEval', label: 'HumanEval', max: 100 },
  { key: 'gsm8k', label: 'GSM8K', max: 100 },
  { key: 'mtBench', label: 'MT-Bench', max: 10 },
] as const

export default function RadarChart({ benchmarks, size = 240 }: RadarChartProps) {
  const available = METRICS.filter((m) => benchmarks[m.key] != null)
  if (available.length < 3) return null

  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38
  const n = available.length

  const angleStep = (2 * Math.PI) / n
  const startAngle = -Math.PI / 2

  const getPoint = (index: number, value: number, max: number) => {
    const angle = startAngle + index * angleStep
    const pct = value / max
    return {
      x: cx + r * pct * Math.cos(angle),
      y: cy + r * pct * Math.sin(angle),
    }
  }

  const gridLevels = [0.25, 0.5, 0.75, 1.0]

  const dataPoints = available.map((m, i) => {
    const val = benchmarks[m.key]!
    return getPoint(i, val, m.max)
  })

  const polyPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="radar-chart-container">
      <svg viewBox={`0 0 ${size} ${size}`} className="radar-svg" width={size} height={size}>
        {gridLevels.map((level) => {
          const points = available
            .map((_, i) => {
              const angle = startAngle + i * angleStep
              return `${cx + r * level * Math.cos(angle)},${cy + r * level * Math.sin(angle)}`
            })
            .join(' ')
          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
              opacity={0.6}
            />
          )
        })}

        {available.map((_, i) => {
          const angle = startAngle + i * angleStep
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + r * Math.cos(angle)}
              y2={cy + r * Math.sin(angle)}
              stroke="var(--border)"
              strokeWidth="1"
              opacity={0.4}
            />
          )
        })}

        <polygon
          points={polyPoints}
          fill="var(--accent)"
          fillOpacity={0.15}
          stroke="var(--accent)"
          strokeWidth="2"
        />

        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="var(--accent)"
          />
        ))}

        {available.map((m, i) => {
          const angle = startAngle + i * angleStep
          const labelR = r + 22
          const lx = cx + labelR * Math.cos(angle)
          const ly = cy + labelR * Math.sin(angle)
          const val = benchmarks[m.key]!
          const displayVal = m.max === 10 ? val.toFixed(1) : val.toFixed(0)
          return (
            <text
              key={m.key}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="radar-label"
            >
              {m.label} ({displayVal})
            </text>
          )
        })}
      </svg>
    </div>
  )
}
