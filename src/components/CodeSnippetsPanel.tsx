import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { CodeSnippet } from '../types'

interface CodeSnippetsPanelProps {
  snippets?: CodeSnippet[]
  modelName: string
}

export default function CodeSnippetsPanel({ snippets, modelName }: CodeSnippetsPanelProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!snippets || snippets.length === 0) {
    return (
      <div className="code-snippets-panel">
        <h3>Getting Started</h3>
        <p className="empty-message">No code snippets available yet for {modelName}</p>
        <p className="empty-hint">Check the official documentation for integration examples</p>
      </div>
    )
  }

  const current = snippets[selectedIndex]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(current.code)
      setCopiedIndex(selectedIndex)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="code-snippets-panel">
      <div className="snippets-header">
        <h3>Code Examples</h3>
        <div className="snippet-tabs">
          {snippets.map((snippet, idx) => (
            <button
              key={idx}
              className={`snippet-tab ${idx === selectedIndex ? 'active' : ''}`}
              onClick={() => setSelectedIndex(idx)}
              aria-selected={idx === selectedIndex}
            >
              {snippet.label}
            </button>
          ))}
        </div>
      </div>

      <div className="snippet-viewer">
        <div className="snippet-toolbar">
          <span className="snippet-info">
            {current.language === 'curl' ? 'cURL' : current.language.charAt(0).toUpperCase() + current.language.slice(1)}
          </span>
          <button
            className="copy-button"
            onClick={copyToClipboard}
            aria-label="Copy code to clipboard"
            title="Copy code"
          >
            {copiedIndex === selectedIndex ? (
              <>
                <Check size={16} aria-hidden="true" /> Copied!
              </>
            ) : (
              <>
                <Copy size={16} aria-hidden="true" /> Copy
              </>
            )}
          </button>
        </div>

        <pre className="code-block">
          <code>{current.code}</code>
        </pre>
      </div>

      <p className="snippet-hint">
        Replace API keys and parameters with your own values. See the{' '}
        <a href="#" className="snippet-link">
          documentation
        </a>
        {' '}for more options.
      </p>
    </div>
  )
}
