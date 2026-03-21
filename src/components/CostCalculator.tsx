import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calculator, ArrowLeft } from 'lucide-react'
import { models } from '../data/models'
import { usePageTitle } from '../hooks/usePageTitle'

export default function CostCalculator() {
  const [inputTokens, setInputTokens] = useState(1000000)
  const [outputTokens, setOutputTokens] = useState(500000)
  const [requestsPerDay, setRequestsPerDay] = useState(100)

  usePageTitle('Cost Calculator')

  const pricedModels = useMemo(
    () =>
      models
        .filter((m) => m.pricing.inputPerMillion && m.pricing.outputPerMillion)
        .sort((a, b) => {
          const costA =
            (a.pricing.inputPerMillion! * inputTokens +
              a.pricing.outputPerMillion! * outputTokens) /
            1_000_000
          const costB =
            (b.pricing.inputPerMillion! * inputTokens +
              b.pricing.outputPerMillion! * outputTokens) /
            1_000_000
          return costA - costB
        }),
    [inputTokens, outputTokens],
  )

  const calcCost = (inputPM: number, outputPM: number) => {
    const perRequest =
      (inputPM * inputTokens + outputPM * outputTokens) / 1_000_000
    return {
      perRequest,
      daily: perRequest * requestsPerDay,
      monthly: perRequest * requestsPerDay * 30,
    }
  }

  const formatUsd = (n: number) => {
    if (n < 0.01) return `$${n.toFixed(4)}`
    if (n < 1) return `$${n.toFixed(3)}`
    return `$${n.toFixed(2)}`
  }

  return (
    <div className="calculator-page">
      <Link to="/" className="back-btn">
        <ArrowLeft size={16} aria-hidden="true" /> Back to models
      </Link>

      <div className="calc-hero">
        <h1><Calculator size={24} aria-hidden="true" /> Cost Calculator</h1>
        <p>Estimate API costs across models based on your usage patterns.</p>
      </div>

      <div className="calc-inputs">
        <div className="calc-input-group">
          <label>Input tokens per request</label>
          <input
            type="number"
            value={inputTokens}
            onChange={(e) => setInputTokens(Math.max(0, +e.target.value))}
            min={0}
            step={1000}
          />
          <span className="calc-hint">{(inputTokens / 1000).toFixed(0)}K tokens</span>
        </div>
        <div className="calc-input-group">
          <label>Output tokens per request</label>
          <input
            type="number"
            value={outputTokens}
            onChange={(e) => setOutputTokens(Math.max(0, +e.target.value))}
            min={0}
            step={1000}
          />
          <span className="calc-hint">{(outputTokens / 1000).toFixed(0)}K tokens</span>
        </div>
        <div className="calc-input-group">
          <label>Requests per day</label>
          <input
            type="number"
            value={requestsPerDay}
            onChange={(e) => setRequestsPerDay(Math.max(0, +e.target.value))}
            min={0}
            step={10}
          />
        </div>
      </div>

      <div className="calc-table-wrap">
        <table className="calc-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Provider</th>
              <th>Per Request</th>
              <th>Daily ({requestsPerDay} req)</th>
              <th>Monthly (30 days)</th>
            </tr>
          </thead>
          <tbody>
            {pricedModels.map((m) => {
              const cost = calcCost(
                m.pricing.inputPerMillion!,
                m.pricing.outputPerMillion!,
              )
              return (
                <tr key={m.id}>
                  <td className="calc-model-name">{m.name}</td>
                  <td>
                    <span className="table-provider">
                      <span
                        className="provider-dot"
                        style={{ background: m.providerColor }}
                      />
                      {m.provider}
                    </span>
                  </td>
                  <td className="calc-cost">{formatUsd(cost.perRequest)}</td>
                  <td className="calc-cost">{formatUsd(cost.daily)}</td>
                  <td className="calc-cost calc-monthly">{formatUsd(cost.monthly)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
