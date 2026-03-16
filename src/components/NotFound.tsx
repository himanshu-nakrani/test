import { Link } from 'react-router-dom'
import { SearchX, ArrowLeft } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('Page Not Found')

  return (
    <main className="main">
      <div className="not-found-page">
        <span className="not-found-icon"><SearchX size={48} aria-hidden="true" /></span>
        <h1 className="not-found-title">404</h1>
        <p className="not-found-subtitle">This page has drifted into uncharted territory.</p>
        <Link to="/" className="not-found-link"><ArrowLeft size={16} aria-hidden="true" /> Back to NeuralAtlas</Link>
      </div>
    </main>
  )
}
