import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('Page Not Found')

  return (
    <main className="main">
      <div className="not-found-page">
        <span className="not-found-icon">🌌</span>
        <h1 className="not-found-title">404</h1>
        <p className="not-found-subtitle">This page has drifted into uncharted territory.</p>
        <Link to="/" className="not-found-link">← Back to NeuralAtlas</Link>
      </div>
    </main>
  )
}
