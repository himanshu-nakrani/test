import { useState, useMemo } from 'react'
import { DollarSign, TrendingUp } from 'lucide-react'
import type { AIModel } from '../types'

interface PricingCalculatorProps {
  models: AIModel[]
  selectedModelIds?: string[]
}

export default function PricingCalculator({ models, selectedModelIds = [] }: PricingCalculatorProps) {
  const [monthlyTokens, setMonthlyTokens] = useState(1000000) // 1M tokens default
  const [inputTokenRatio, setInputTokenRatio] = useState(0.7) // 70% input, 30% output

  const selectedModels = useMemo(
    () => models.filter((m) => selectedModelIds.includes(m.id)),
    [models, selectedModelIds]
  )

  const calculateCost = (model: AIModel) => {
    if (!model.pricing.inputPerMillion || !model.pricing.outputPerMillion) return 0
    const inputTokens = monthlyTokens * inputTokenRatio
    const outputTokens = monthlyTokens * (1 - inputTokenRatio)
    const inputCost = (inputTokens / 1_000_000) * model.pricing.inputPerMillion
    const outputCost = (outputTokens / 1_000_000) * model.pricing.outputPerMillion
    return inputCost + outputCost
  }

  const calculatePricePer1K = (model: AIModel) => {
    if (!model.pricing.inputPerMillion || !model.pricing.outputPerMillion) return 0
    const avgPrice =
      (model.pricing.inputPerMillion + model.pricing.outputPerMillion) / 2
    return (avgPrice / 1000).toFixed(4)
  }

  const modelCosts = useMemo(
    () =>
      selectedModels.map((model) => ({
        model,
        monthlyCost: calculateCost(model),
        per1kCost: calculatePricePer1K(model),
      })),
    [selectedModels, monthlyTokens, inputTokenRatio]
  )

  const cheapest =
    modelCosts.length > 0
      ? Math.min(...modelCosts.map((m) => m.monthlyCost))
      : 0

  return (
    <div className="pricing-calculator">
      <div className="pricing-calc-header">
        <h3>
          <DollarSign size={20} aria-hidden="true" /> Pricing Calculator
        </h3>
        <p>Estimate monthly costs for your usage patterns</p>
      </div>

      <div className="pricing-inputs">
        <div className="input-group">
          <label htmlFor="monthly-tokens">Monthly Tokens</label>
          <input
            id="monthly-tokens"
            type="range"
            min="100000"
            max="100000000"
            step="100000"
            value={monthlyTokens}
            onChange={(e) => setMonthlyTokens(Number(e.target.value))}
            className="slider-input"
          />
          <div className="input-display">
            <span className="token-value">{(monthlyTokens / 1_000_000).toFixed(1)}M tokens</span>
            <input
              type="number"
              value={monthlyTokens}
              onChange={(e) => setMonthlyTokens(Math.max(100000, Number(e.target.value) || 0))}
              className="token-input"
              placeholder="Enter tokens"
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="input-ratio">Input/Output Ratio</label>
          <div className="ratio-display">
            <span className="ratio-label">{Math.round(inputTokenRatio * 100)}% input</span>
            <input
              id="input-ratio"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={inputTokenRatio}
              onChange={(e) => setInputTokenRatio(Number(e.target.value))}
              className="slider-input"
            />
            <span className="ratio-label">{Math.round((1 - inputTokenRatio) * 100)}% output</span>
          </div>
        </div>
      </div>

      {modelCosts.length > 0 ? (
        <div className="pricing-results">
          <div className="results-header">
            <h4>Cost Comparison</h4>
            <span className="results-hint">Based on {(monthlyTokens / 1_000_000).toFixed(1)}M monthly tokens</span>
          </div>

          <div className="cost-cards">
            {modelCosts.map(({ model, monthlyCost, per1kCost }) => (
              <div
                key={model.id}
                className="cost-card"
                style={{
                  opacity: monthlyCost === cheapest ? 1 : 0.85,
                  transform: monthlyCost === cheapest ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {monthlyCost === cheapest && <div className="cost-badge">Cheapest</div>}
                <div className="cost-card-header">
                  <div>
                    <h5>{model.name}</h5>
                    <p className="cost-provider">{model.provider}</p>
                  </div>
                </div>
                <div className="cost-breakdown">
                  <div className="cost-row">
                    <span className="cost-label">Per 1K tokens</span>
                    <span className="cost-value">${per1kCost}</span>
                  </div>
                  <div className="cost-row total">
                    <span className="cost-label">Monthly estimate</span>
                    <span className="cost-value">${monthlyCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="pricing-empty">
          <TrendingUp size={32} aria-hidden="true" />
          <p>Select models to compare pricing</p>
        </div>
      )}
    </div>
  )
}
