import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AIModel } from '../types'

interface TimelineProps {
  models: AIModel[]
}

interface MonthGroup {
  label: string
  sortKey: string
  models: AIModel[]
}

export default function Timeline({ models }: TimelineProps) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState<AIModel | null>(null)

  const groups = useMemo(() => {
    const sorted = [...models].sort(
      (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime(),
    )
    const map = new Map<string, MonthGroup>()
    for (const m of sorted) {
      const d = new Date(m.releaseDate)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) {
        const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        map.set(key, { label, sortKey: key, models: [] })
      }
      map.get(key)!.models.push(m)
    }
    return [...map.values()].sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  }, [models])

  return (
    <div className="timeline-container">
      <div className="timeline-track">
        {groups.map((group) => (
          <div key={group.sortKey} className="timeline-group">
            <div className="timeline-month-label">{group.label}</div>
            <div className="timeline-dots">
              {group.models.map((m) => (
                <button
                  key={m.id}
                  className={`timeline-dot ${hovered?.id === m.id ? 'active' : ''}`}
                  style={{ background: m.providerColor }}
                  onMouseEnter={() => setHovered(m)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => navigate(`/models/${m.id}`)}
                  aria-label={`${m.name} - ${m.provider}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {hovered && (
        <div className="timeline-tooltip">
          <strong>{hovered.name}</strong>
          <span>{hovered.provider}</span>
          <span>{new Date(hovered.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      )}
    </div>
  )
}
