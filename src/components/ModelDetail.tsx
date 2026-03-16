import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  MessageSquare, Brain, Code, Eye, Layers, Image as ImageIcon, Music, Video,
  BarChart3, DollarSign, ArrowLeftRight, TrendingUp, CheckCircle, AlertTriangle,
  Target, Link as LinkIcon, Zap, Gauge, History, Copy, ArrowLeft, Star,
  Type, Volume2, Film,
} from 'lucide-react'
import type { AIModel } from '../types'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { usePageTitle } from '../hooks/usePageTitle'
import { models } from '../data/models'
import CodeBlock from './CodeBlock'
import RadarChart from './RadarChart'
import ReviewSection from './ReviewSection'

interface ModelDetailProps {
  model: AIModel
  isFav: boolean
  onToggleFav: (id: string) => void
}

function categoryIcon(cat: string): ReactNode {
  const icons: Record<string, ReactNode> = {
    chat: <MessageSquare size={14} aria-hidden="true" />,
    reasoning: <Brain size={14} aria-hidden="true" />,
    code: <Code size={14} aria-hidden="true" />,
    vision: <Eye size={14} aria-hidden="true" />,
    embedding: <Layers size={14} aria-hidden="true" />,
    image: <ImageIcon size={14} aria-hidden="true" />,
    audio: <Music size={14} aria-hidden="true" />,
    video: <Video size={14} aria-hidden="true" />,
  }
  return icons[cat] || null
}

function modalityIcon(mod: string): ReactNode {
  const icons: Record<string, ReactNode> = {
    text: <Type size={14} aria-hidden="true" />,
    image: <ImageIcon size={14} aria-hidden="true" />,
    audio: <Volume2 size={14} aria-hidden="true" />,
    video: <Film size={14} aria-hidden="true" />,
    code: <Code size={14} aria-hidden="true" />,
    embeddings: <Layers size={14} aria-hidden="true" />,
  }
  return icons[mod] || null
}

const modalityLabelText: Record<string, string> = {
  text: 'Text', image: 'Image', audio: 'Audio',
  video: 'Video', code: 'Code', embeddings: 'Embeddings',
}

export default function ModelDetail({ model, isFav, onToggleFav }: ModelDetailProps) {
  const navigate = useNavigate()
  const { copy: copyEndpoint, copied: copiedEndpoint } = useCopyToClipboard()
  const { copy: copyName, copied: copiedName } = useCopyToClipboard()

  usePageTitle(model.name)

  const related = models
    .filter(
      (m) =>
        m.id !== model.id &&
        (m.provider === model.provider ||
          m.categories.some((c) => model.categories.includes(c))),
    )
    .slice(0, 4)

  const hasBenchmarks = model.benchmarks && Object.values(model.benchmarks).some((v) => v != null)

  const handleModelClick = (m: AIModel) => {
    navigate(`/models/${m.id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="model-detail">
      <div className="detail-top-bar">
        <div className="detail-top-left">
          <nav className="breadcrumbs">
            <Link to="/" className="breadcrumb-link">Models</Link>
            <span className="breadcrumb-sep">&gt;</span>
            <span className="breadcrumb-current">{model.name}</span>
          </nav>
          <Link to="/" className="back-btn"><ArrowLeft size={16} aria-hidden="true" /> Back to all models</Link>
        </div>
        <button
          className={`fav-btn fav-btn-lg ${isFav ? 'is-fav' : ''}`}
          onClick={() => onToggleFav(model.id)}
        >
          <Star size={18} fill={isFav ? 'currentColor' : 'none'} aria-hidden="true" /> {isFav ? 'Favorited' : 'Add to favorites'}
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
            {copiedName ? '✓' : <Copy size={14} aria-hidden="true" />}
          </button>
        </h1>
        <p className="detail-description">{model.longDescription}</p>

        <div className="detail-categories">
          {model.categories.map((cat) => (
            <span key={cat} className="category-tag category-tag-lg">{categoryIcon(cat)} {cat}</span>
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
        <motion.div
          className="detail-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h3><BarChart3 size={18} className="section-icon" aria-hidden="true" /> Specifications</h3>
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
        </motion.div>

        {/* Pricing */}
        <motion.div
          className="detail-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3><DollarSign size={18} className="section-icon" aria-hidden="true" /> Pricing</h3>
          <dl className="spec-list">
            <div className="spec-row"><dt>Input</dt><dd>{model.pricing.input}</dd></div>
            <div className="spec-row"><dt>Output</dt><dd>{model.pricing.output}</dd></div>
            <div className="spec-row">
              <dt>Tier</dt>
              <dd>
                <span className={`pricing-pill pricing-${model.pricingTier}`}>
                  {model.pricing.free ? 'Free' : model.pricingTier}
                </span>
              </dd>
            </div>
          </dl>
        </motion.div>

        {/* Modalities */}
        {(model.inputModalities || model.outputModalities) && (
          <motion.div
            className="detail-card detail-card-wide"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <h3><ArrowLeftRight size={18} className="section-icon" aria-hidden="true" /> Input / Output Modalities</h3>
            <div className="modalities-grid">
              <div>
                <h4>Accepts</h4>
                <div className="modality-chips">
                  {(model.inputModalities || []).map((m) => (
                    <span key={m} className="modality-chip modality-in">{modalityIcon(m)} {modalityLabelText[m] || m}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4>Produces</h4>
                <div className="modality-chips">
                  {(model.outputModalities || []).map((m) => (
                    <span key={m} className="modality-chip modality-out">{modalityIcon(m)} {modalityLabelText[m] || m}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Benchmarks */}
        {hasBenchmarks && (
          <motion.div
            className="detail-card detail-card-wide"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <h3><TrendingUp size={18} className="section-icon" aria-hidden="true" /> Benchmark Scores</h3>
            <div className="benchmark-layout">
              <div className="benchmark-bars">
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
              <RadarChart benchmarks={model.benchmarks!} />
            </div>
          </motion.div>
        )}

        {/* Strengths & Limitations */}
        <motion.div
          className="detail-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h3><CheckCircle size={18} className="section-icon" aria-hidden="true" /> Strengths</h3>
          <ul className="detail-list strengths-list">
            {model.strengths.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </motion.div>
        <motion.div
          className="detail-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3><AlertTriangle size={18} className="section-icon" aria-hidden="true" /> Limitations</h3>
          <ul className="detail-list limitations-list">
            {model.limitations.map((l) => <li key={l}>{l}</li>)}
          </ul>
        </motion.div>

        {/* Use Cases */}
        <motion.div
          className="detail-card detail-card-wide"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h3><Target size={18} className="section-icon" aria-hidden="true" /> Use Cases</h3>
          <div className="use-case-grid">
            {model.useCases.map((u) => <div key={u} className="use-case-item">{u}</div>)}
          </div>
        </motion.div>

        {/* API & Documentation */}
        <motion.div
          className="detail-card detail-card-wide"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h3><LinkIcon size={18} className="section-icon" aria-hidden="true" /> API & Documentation</h3>
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
        </motion.div>

        {/* Rate Limits */}
        {model.rateLimits && (
          <motion.div
            className="detail-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <h3><Gauge size={18} className="section-icon" aria-hidden="true" /> Rate Limits</h3>
            <dl className="spec-list">
              {model.rateLimits.rpm && <div className="spec-row"><dt>Requests/min</dt><dd>{model.rateLimits.rpm}</dd></div>}
              {model.rateLimits.tpm && <div className="spec-row"><dt>Tokens/min</dt><dd>{model.rateLimits.tpm}</dd></div>}
              {model.rateLimits.notes && <div className="spec-row"><dt>Notes</dt><dd>{model.rateLimits.notes}</dd></div>}
            </dl>
          </motion.div>
        )}

        {/* Version History */}
        {model.versions && model.versions.length > 0 && (
          <motion.div
            className="detail-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <h3><History size={18} className="section-icon" aria-hidden="true" /> Version History</h3>
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
          </motion.div>
        )}

        {/* Code Snippets */}
        {model.codeSnippets && model.codeSnippets.length > 0 && (
          <motion.div
            className="detail-card detail-card-wide"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <h3><Zap size={18} className="section-icon" aria-hidden="true" /> Quick Start</h3>
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
          </motion.div>
        )}
      </div>

      {/* Reviews */}
      <ReviewSection modelId={model.id} />

      {/* Related Models */}
      {related.length > 0 && (
        <div className="related-section">
          <h2>Related Models</h2>
          <div className="related-grid">
            {related.map((r) => (
              <button key={r.id} className="related-card" onClick={() => handleModelClick(r)}>
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
