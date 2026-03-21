import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scale, X, MessageSquare, Brain, Code, Eye, Layers, Image, Music, Video, Pin, PinOff, Download, Rows3 } from 'lucide-react'
import type { AIModel } from '../types'
import { usePageTitle } from '../hooks/usePageTitle'

interface CompareViewProps {
  models: AIModel[]
  onRemove: (id: string) => void
}

function categoryIcon(cat: string): ReactNode {
  const icons: Record<string, ReactNode> = {
    chat: <MessageSquare size={12} aria-hidden="true" />,
    reasoning: <Brain size={12} aria-hidden="true" />,
    code: <Code size={12} aria-hidden="true" />,
    vision: <Eye size={12} aria-hidden="true" />,
    embedding: <Layers size={12} aria-hidden="true" />,
    image: <Image size={12} aria-hidden="true" />,
    audio: <Music size={12} aria-hidden="true" />,
    video: <Video size={12} aria-hidden="true" />,
  }
  return icons[cat] || null
}

export default function CompareView({ models, onRemove }: CompareViewProps) {
  const navigate = useNavigate()
  usePageTitle('Compare Models')
  const [diffOnly, setDiffOnly] = useState(false)
  const [pinnedRows, setPinnedRows] = useState<Set<string>>(new Set())

  if (models.length < 2) return null

  const handleModelClick = (m: AIModel) => {
    navigate(`/models/${m.id}`)
  }

  const rows: { id: string; label: string; render: (m: AIModel) => React.ReactNode; value: (m: AIModel) => string }[] = [
    {
      id: 'provider',
      label: 'Provider',
      render: (m) => (
        <span className="compare-provider">
          <span className="provider-dot" style={{ background: m.providerColor }} />
          {m.provider}
        </span>
      ),
      value: (m) => m.provider,
    },
    {
      id: 'categories',
      label: 'Categories',
      render: (m) => (
        <div className="compare-cats">
          {m.categories.map((c) => (
            <span key={c} className="category-tag category-tag-sm">
              {categoryIcon(c)} {c}
            </span>
          ))}
        </div>
      ),
      value: (m) => m.categories.join('|'),
    },
    { id: 'parameters', label: 'Parameters', render: (m) => m.parameters, value: (m) => m.parameters },
    { id: 'context', label: 'Context Window', render: (m) => <strong>{m.contextWindow}</strong>, value: (m) => m.contextWindow },
    { id: 'inputPrice', label: 'Input Price', render: (m) => m.pricing.input, value: (m) => m.pricing.input },
    { id: 'outputPrice', label: 'Output Price', render: (m) => m.pricing.output, value: (m) => m.pricing.output },
    {
      id: 'pricingTier',
      label: 'Pricing Tier',
      render: (m) => (
        <span className={`pricing-pill pricing-${m.pricingTier}`}>
          {m.pricing.free ? 'Free' : m.pricingTier}
        </span>
      ),
      value: (m) => `${m.pricingTier}:${m.pricing.free ? 'free' : 'paid'}`,
    },
    {
      id: 'license',
      label: 'License',
      render: (m) => (
        <span className={`license-badge license-${m.license}`}>
          {m.license}
        </span>
      ),
      value: (m) => m.license,
    },
    {
      id: 'releaseDate',
      label: 'Release Date',
      render: (m) =>
        new Date(m.releaseDate).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
      value: (m) => m.releaseDate,
    },
    {
      id: 'strengths',
      label: 'Strengths',
      render: (m) => (
        <ul className="compare-list compare-strengths">
          {m.strengths.map((s) => <li key={s}>{s}</li>)}
        </ul>
      ),
      value: (m) => m.strengths.join('|'),
    },
    {
      id: 'limitations',
      label: 'Limitations',
      render: (m) => (
        <ul className="compare-list compare-limitations">
          {m.limitations.map((l) => <li key={l}>{l}</li>)}
        </ul>
      ),
      value: (m) => m.limitations.join('|'),
    },
  ]

  const isDifferent = (rowId: string, values: string[]) => {
    if (pinnedRows.has(rowId)) return true
    if (values.length < 2) return true
    return new Set(values).size > 1
  }

  const visibleRows = useMemo(() => {
    if (!diffOnly) return rows
    return rows.filter((row) => isDifferent(row.id, models.map((m) => row.value(m))))
  }, [diffOnly, models, pinnedRows])

  const togglePinned = (rowId: string) => {
    setPinnedRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) next.delete(rowId)
      else next.add(rowId)
      return next
    })
  }

  const exportJson = () => {
    const payload = {
      comparedAt: new Date().toISOString(),
      models: models.map((m) => ({
        id: m.id,
        name: m.name,
        provider: m.provider,
        parameters: m.parameters,
        contextWindow: m.contextWindow,
        inputPrice: m.pricing.input,
        outputPrice: m.pricing.output,
        pricingTier: m.pricingTier,
        license: m.license,
        releaseDate: m.releaseDate,
      })),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `model-comparison-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCsv = () => {
    const header = ['field', ...models.map((m) => m.name)]
    const lines = [header.join(',')]
    rows.forEach((row) => {
      const values = models.map((m) => row.value(m).replaceAll('"', '""'))
      lines.push(`"${row.label.replaceAll('"', '""')}",${values.map((v) => `"${v}"`).join(',')}`)
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `model-comparison-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="compare-view">
      <div className="compare-header">
        <h2><Scale size={24} aria-hidden="true" /> Model Comparison</h2>
        <div className="compare-actions">
          <button className={`compare-close ${diffOnly ? 'active' : ''}`} onClick={() => setDiffOnly((v) => !v)}>
            <Rows3 size={14} aria-hidden="true" /> {diffOnly ? 'Show all rows' : 'Differences only'}
          </button>
          <button className="compare-close" onClick={exportCsv}><Download size={14} aria-hidden="true" /> Export CSV</button>
          <button className="compare-close" onClick={exportJson}><Download size={14} aria-hidden="true" /> Export JSON</button>
          <button className="compare-close" onClick={() => navigate('/')}><X size={14} aria-hidden="true" /> Close</button>
        </div>
      </div>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="compare-label-col"></th>
              {models.map((m) => (
                <th key={m.id} className="compare-model-col">
                  <button className="compare-model-header" onClick={() => handleModelClick(m)}>
                    <span className="compare-model-name">{m.name}</span>
                    <span className="compare-view-detail">View details</span>
                  </button>
                  <button
                    className="compare-remove"
                    onClick={() => onRemove(m.id)}
                    title="Remove from comparison"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id}>
                <td className="compare-label">
                  <div className="compare-label-actions">
                    <span>{row.label}</span>
                    <button className="compare-row-pin" onClick={() => togglePinned(row.id)} title={pinnedRows.has(row.id) ? 'Unpin row' : 'Pin row'}>
                      {pinnedRows.has(row.id) ? <PinOff size={12} aria-hidden="true" /> : <Pin size={12} aria-hidden="true" />}
                    </button>
                  </div>
                </td>
                {models.map((m) => (
                  <td key={m.id} className="compare-cell">
                    {row.render(m)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
