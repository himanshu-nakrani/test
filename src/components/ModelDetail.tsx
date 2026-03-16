import type { AIModel } from '../types'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { models } from '../data/models'
import CodeBlock from './CodeBlock'

interface ModelDetailProps {
  model: AIModel
  onBack: () => void
  onModelClick: (model: AIModel) => void
  isFav: boolean
  onToggleFav: (id: string) => void
}

const categoryEmoji: Record<string, string> = {
  chat: '💬', reasoning: '🧠', code: '💻', vision: '👁️',
  embedding: '📐', image: '🎨', audio: '🎵', video: '🎬',
}

const modalityLabel: Record<string, string> = {
  text: '📝 Text', image: '🖼️ Image', audio: '🔊 Audio',
  video: '🎥 Video', code: '💻 Code', embeddings: '📐 Embeddings',
}

export default function ModelDetail({ model, onBack, onModelClick, isFav, onToggleFav }: ModelDetailProps) {
  const { copy: copyEndpoint, copied: copiedEndpoint } = useCopyToClipboard()
  const { copy: copyName, copied: copiedName } = useCopyToClipboard()

  const related = models
    .filter(
      (m) =>
        m.id !== model.id &&
        (m.provider === model.provider ||
          m.categories.some((c) => model.categories.includes(c))),
    )
    .slice(0, 4)

  const hasBenchmarks = model.benchmarks && Object.values(model.benchmarks).some((v) => v != null)

  return (
    <div className="model-detail">
      <div className="detail-top-bar">
        <button className="back-btn" onClick={onBack}>← Back to all models</button>
        <button
          className={`fav-btn fav-btn-lg ${isFav ? 'is-fav' : ''}`}
          onClick={() => onToggleFav(model.id)}
        >
          {isFav ? '★ Favorited' : '☆ Add to favorites'}
        </button>
      </div>

      {/* Hero */}
      <div className="detail-hero">
        <div className="detail-provider">
          <div className="provider-dot provider-dot-lg" style={{ background: model.providerColor }} />
          <span>{model.provider}</span>
          <span className={`license-badge license-${model.license}`}>{model.license}</span>
          {model.isNew && <span className="badge badge-new">New</span>}
          {model.isFeatured && <span className="badge badge-featured">Featured</span>}
        </div>
        <h1 className="detail-title">
          {model.name}
          <button className="copy-name-btn" onClick={() => copyName(model.name)} title="Copy model name">
            {copiedName ? '✓' : '⧉'}
          </button>
        </h1>
        <p className="detail-description">{model.longDescription}</p>

        <div className="detail-categories">
          {model.categories.map((cat) => (
            <span key={cat} className="category-tag category-tag-lg">{categoryEmoji[cat]} {cat}</span>
          ))}
        </div>

        {model.tags && model.tags.length > 0 && (
          <div className="detail-tags">
            {model.tags.map((tag) => (
              <span key={tag} className="detail-tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="detail-grid">
        {/* Specifications */}
        <div className="detail-card">
          <h3>📊 Specifications</h3>
          <dl className="spec-list">
            <div className="spec-row"><dt>Parameters</dt><dd>{model.parameters}</dd></div>
            <div className="spec-row"><dt>Context Window</dt><dd><strong>{model.contextWindow}</strong></dd></div>
            {model.latencyInfo ? (
              <>
                <div className="spec-row"><dt>Latency</dt><dd>{model.latencyInfo.label}</dd></div>
                {model.latencyInfo.ttfb && <div className="spec-row"><dt>TTFB</dt><dd>{model.latencyInfo.ttfb}</dd></div>}
                {model.latencyInfo.tokensPerSec && <div className="spec-row"><dt>Speed</dt><dd>{model.latencyInfo.tokensPerSec}</dd></div>}
              </>
            ) : model.latency ? (
              <div className="spec-row"><dt>Latency</dt><dd>{model.latency}</dd></div>
            ) : null}
            {model.modelSize && <div className="spec-row"><dt>Model Size</dt><dd>{model.modelSize}</dd></div>}
            <div className="spec-row">
              <dt>Release Date</dt>
              <dd>{new Date(model.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
            </div>
            {model.lastUpdated && <div className="spec-row"><dt>Data Updated</dt><dd>{model.lastUpdated}</dd></div>}
            <div className="spec-row"><dt>License</dt><dd className="capitalize">{model.license}</dd></div>
          </dl>
        </div>

        {/* Pricing */}
        <div className="detail-card">
          <h3>💰 Pricing</h3>
          <dl className="spec-list">
            <div className="spec-row"><dt>Input</dt><dd>{model.pricing.input}</dd></div>
            <div className="spec-row"><dt>Output</dt><dd>{model.pricing.output}</dd></div>
            <div className="spec-row">
              <dt>Tier</dt>
              <dd>
                <span className={`pricing-pill pricing-${model.pricingTier}`}>
                  {model.pricing.free ? '🆓 Free' : model.pricingTier}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Modalities */}
        {(model.inputModalities || model.outputModalities) && (
          <div className="detail-card detail-card-wide">
            <h3>🔄 Input / Output Modalities</h3>
            <div className="modalities-grid">
              <div>
                <h4>Accepts</h4>
                <div className="modality-chips">
                  {(model.inputModalities || []).map((m) => (
                    <span key={m} className="modality-chip modality-in">{modalityLabel[m] || m}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4>Produces</h4>
                <div className="modality-chips">
                  {(model.outputModalities || []).map((m) => (
                    <span key={m} className="modality-chip modality-out">{modalityLabel[m] || m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benchmarks */}
        {hasBenchmarks && (
          <div className="detail-card detail-card-wide">
            <h3>📈 Benchmark Scores</h3>
            <div className="benchmark-grid">
              {model.benchmarks!.mmlu != null && (
                <div className="benchmark-item">
                  <div className="bench-label">MMLU</div>
                  <div className="bench-bar-bg"><div className="bench-bar" style={{ width: `${model.benchmarks!.mmlu}%` }} /></div>
                  <div className="bench-score">{model.benchmarks!.mmlu!.toFixed(1)}</div>
                </div>
              )}
              {model.benchmarks!.humanEval != null && (
                <div className="benchmark-item">
                  <div className="bench-label">HumanEval</div>
                  <div className="bench-bar-bg"><div className="bench-bar bench-bar-green" style={{ width: `${model.benchmarks!.humanEval}%` }} /></div>
                  <div className="bench-score">{model.benchmarks!.humanEval!.toFixed(1)}</div>
                </div>
              )}
              {model.benchmarks!.gsm8k != null && (
                <div className="benchmark-item">
                  <div className="bench-label">GSM8K</div>
                  <div className="bench-bar-bg"><div className="bench-bar bench-bar-purple" style={{ width: `${model.benchmarks!.gsm8k}%` }} /></div>
                  <div className="bench-score">{model.benchmarks!.gsm8k!.toFixed(1)}</div>
                </div>
              )}
              {model.benchmarks!.mtBench != null && (
                <div className="benchmark-item">
                  <div className="bench-label">MT-Bench</div>
                  <div className="bench-bar-bg"><div className="bench-bar bench-bar-orange" style={{ width: `${(model.benchmarks!.mtBench! / 10) * 100}%` }} /></div>
                  <div className="bench-score">{model.benchmarks!.mtBench!.toFixed(1)}/10</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Strengths & Limitations */}
        <div className="detail-card">
          <h3>✅ Strengths</h3>
          <ul className="detail-list strengths-list">
            {model.strengths.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
        <div className="detail-card">
          <h3>⚠️ Limitations</h3>
          <ul className="detail-list limitations-list">
            {model.limitations.map((l) => <li key={l}>{l}</li>)}
          </ul>
        </div>

        {/* Use Cases */}
        <div className="detail-card detail-card-wide">
          <h3>🎯 Use Cases</h3>
          <div className="use-case-grid">
            {model.useCases.map((u) => <div key={u} className="use-case-item">{u}</div>)}
          </div>
        </div>

        {/* API & Documentation */}
        <div className="detail-card detail-card-wide">
          <h3>🔗 API & Documentation</h3>
          <dl className="spec-list">
            <div className="spec-row">
              <dt>API Endpoint</dt>
              <dd className="api-cell">
                <code className="api-code">{model.apiEndpoint}</code>
                <button className={`copy-btn ${copiedEndpoint ? 'copied' : ''}`} onClick={() => copyEndpoint(model.apiEndpoint)}>
                  {copiedEndpoint ? '✓ Copied' : 'Copy'}
                </button>
              </dd>
            </div>
            <div className="spec-row">
              <dt>Documentation</dt>
              <dd><a href={model.documentationUrl} target="_blank" rel="noopener noreferrer" className="doc-link">{model.documentationUrl} ↗</a></dd>
            </div>
          </dl>
        </div>

        {/* Rate Limits */}
        {model.rateLimits && (
          <div className="detail-card">
            <h3>🚦 Rate Limits</h3>
            <dl className="spec-list">
              {model.rateLimits.rpm && <div className="spec-row"><dt>Requests/min</dt><dd>{model.rateLimits.rpm}</dd></div>}
              {model.rateLimits.tpm && <div className="spec-row"><dt>Tokens/min</dt><dd>{model.rateLimits.tpm}</dd></div>}
              {model.rateLimits.notes && <div className="spec-row"><dt>Notes</dt><dd>{model.rateLimits.notes}</dd></div>}
            </dl>
          </div>
        )}

        {/* Version History */}
        {model.versions && model.versions.length > 0 && (
          <div className="detail-card">
            <h3>📋 Version History</h3>
            <div className="version-list">
              {model.versions.map((v) => (
                <div key={v.version} className="version-item">
                  <div className="version-header">
                    <code className="version-id">{v.version}</code>
                    <span className="version-date">{v.date}</span>
                  </div>
                  <p className="version-notes">{v.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Snippets */}
        {model.codeSnippets && model.codeSnippets.length > 0 && (
          <div className="detail-card detail-card-wide">
            <h3>⚡ Quick Start</h3>
            <div className="code-snippets">
              {model.codeSnippets.map((snippet) => (
                <CodeBlock
                  key={snippet.language}
                  code={snippet.code}
                  language={snippet.language}
                  label={snippet.label}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Models */}
      {related.length > 0 && (
        <div className="related-section">
          <h2>Related Models</h2>
          <div className="related-grid">
            {related.map((r) => (
              <button key={r.id} className="related-card" onClick={() => { onModelClick(r); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                <div className="related-provider">
                  <span className="provider-dot" style={{ background: r.providerColor }} />{r.provider}
                </div>
                <div className="related-name">{r.name}</div>
                <div className="related-desc">{r.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
