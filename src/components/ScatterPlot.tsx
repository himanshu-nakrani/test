import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AIModel } from '../types'

interface ScatterPlotProps {
  models: AIModel[]
}

const PADDING = { top: 30, right: 30, bottom: 50, left: 70 }
const WIDTH = 800
const HEIGHT = 500
const DOT_RADIUS = 7

export default function ScatterPlot({ models }: ScatterPlotProps) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState<AIModel | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const eligible = useMemo(
    () => models.filter((m) => m.pricing.inputPerMillion != null && m.benchmarks?.mmlu != null),
    [models],
  )

  const providers = useMemo(() => {
    const unique = [...new Set(eligible.map((m) => m.provider))]
    return unique.sort()
  }, [eligible])

  const providerColorMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of eligible) {
      if (!map.has(m.provider)) map.set(m.provider, m.providerColor)
    }
    return map
  }, [eligible])

  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    const prices = eligible.map((m) => m.pricing.inputPerMillion!)
    const scores = eligible.map((m) => m.benchmarks!.mmlu!)
    return {
      xMin: 0,
      xMax: Math.ceil(Math.max(...prices) * 1.1),
      yMin: Math.floor(Math.min(...scores) * 0.95),
      yMax: Math.ceil(Math.max(...scores) * 1.02),
    }
  }, [eligible])

  const toX = (price: number) =>
    PADDING.left + ((price - xMin) / (xMax - xMin)) * (WIDTH - PADDING.left - PADDING.right)
  const toY = (score: number) =>
    PADDING.top + ((yMax - score) / (yMax - yMin)) * (HEIGHT - PADDING.top - PADDING.bottom)

  const xTicks = useMemo(() => {
    const step = Math.ceil(xMax / 5)
    const ticks: number[] = []
    for (let v = 0; v <= xMax; v += step) ticks.push(v)
    return ticks
  }, [xMax])

  const yTicks = useMemo(() => {
    const range = yMax - yMin
    const step = Math.ceil(range / 5)
    const ticks: number[] = []
    for (let v = yMin; v <= yMax; v += step) ticks.push(v)
    return ticks
  }, [yMin, yMax])

  if (eligible.length === 0) {
    return <p className="scatter-empty">No models with both pricing and MMLU data available.</p>
  }

  return (
    <div className="scatter-plot-container">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="scatter-svg"
        role="img"
        aria-label="Price vs Performance scatter plot"
      >
        {/* Grid lines */}
        {xTicks.map((v) => (
          <line key={`xg-${v}`} x1={toX(v)} y1={PADDING.top} x2={toX(v)} y2={HEIGHT - PADDING.bottom} stroke="var(--border)" strokeDasharray="4 4" />
        ))}
        {yTicks.map((v) => (
          <line key={`yg-${v}`} x1={PADDING.left} y1={toY(v)} x2={WIDTH - PADDING.right} y2={toY(v)} stroke="var(--border)" strokeDasharray="4 4" />
        ))}

        {/* Axes */}
        <line x1={PADDING.left} y1={HEIGHT - PADDING.bottom} x2={WIDTH - PADDING.right} y2={HEIGHT - PADDING.bottom} stroke="var(--text-tertiary)" />
        <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={HEIGHT - PADDING.bottom} stroke="var(--text-tertiary)" />

        {/* X-axis ticks */}
        {xTicks.map((v) => (
          <text key={`xt-${v}`} x={toX(v)} y={HEIGHT - PADDING.bottom + 20} textAnchor="middle" fill="var(--text-secondary)" fontSize="12">
            ${v}
          </text>
        ))}

        {/* Y-axis ticks */}
        {yTicks.map((v) => (
          <text key={`yt-${v}`} x={PADDING.left - 10} y={toY(v) + 4} textAnchor="end" fill="var(--text-secondary)" fontSize="12">
            {v}
          </text>
        ))}

        {/* Axis labels */}
        <text x={(WIDTH + PADDING.left - PADDING.right) / 2} y={HEIGHT - 5} textAnchor="middle" fill="var(--text-secondary)" fontSize="13" fontWeight="500">
          Input Price ($ / 1M tokens)
        </text>
        <text x={15} y={(HEIGHT + PADDING.top - PADDING.bottom) / 2} textAnchor="middle" fill="var(--text-secondary)" fontSize="13" fontWeight="500" transform={`rotate(-90, 15, ${(HEIGHT + PADDING.top - PADDING.bottom) / 2})`}>
          MMLU Score
        </text>

        {/* Data points */}
        {eligible.map((m) => {
          const cx = toX(m.pricing.inputPerMillion!)
          const cy = toY(m.benchmarks!.mmlu!)
          return (
            <circle
              key={m.id}
              cx={cx}
              cy={cy}
              r={hovered?.id === m.id ? DOT_RADIUS + 2 : DOT_RADIUS}
              fill={m.providerColor}
              opacity={hovered && hovered.id !== m.id ? 0.3 : 0.85}
              stroke={hovered?.id === m.id ? 'var(--text-primary)' : 'none'}
              strokeWidth={2}
              style={{ cursor: 'pointer', transition: 'opacity 0.2s, r 0.2s' }}
              onMouseEnter={(e) => {
                setHovered(m)
                const svg = (e.target as SVGElement).closest('svg')
                if (svg) {
                  const rect = svg.getBoundingClientRect()
                  const scaleX = rect.width / WIDTH
                  const scaleY = rect.height / HEIGHT
                  setTooltipPos({ x: cx * scaleX, y: cy * scaleY })
                }
              }}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate(`/models/${m.id}`)}
            />
          )
        })}
      </svg>

      {hovered && (
        <div
          className="scatter-tooltip"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 10 }}
        >
          <strong>{hovered.name}</strong>
          <span>{hovered.provider}</span>
          <span>Price: ${hovered.pricing.inputPerMillion}/1M tokens</span>
          <span>MMLU: {hovered.benchmarks!.mmlu!.toFixed(1)}</span>
        </div>
      )}

      <div className="scatter-legend">
        {providers.map((p) => (
          <span key={p} className="scatter-legend-item">
            <span className="scatter-legend-dot" style={{ background: providerColorMap.get(p) }} />
            {p}
          </span>
        ))}
      </div>
    </div>
  )
}
