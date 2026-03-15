import { useState, useEffect } from 'react'
import './App.css'

const features = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Built with Vite for instant HMR and blazing-fast builds.',
  },
  {
    icon: '🎨',
    title: 'Modern Design',
    description: 'Clean, responsive UI with smooth animations and dark mode.',
  },
  {
    icon: '🔒',
    title: 'Type Safe',
    description: 'Full TypeScript support for robust, maintainable code.',
  },
  {
    icon: '📦',
    title: 'Component-Based',
    description: 'Modular React components for easy reuse and testing.',
  },
]

function App() {
  const [count, setCount] = useState(0)
  const [darkMode, setDarkMode] = useState(false)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">MyApp</span>
        </div>
        <nav className="nav">
          <a href="#features">Features</a>
          <a href="#demo">Demo</a>
          <a href="#newsletter">Newsletter</a>
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Build Something
            <span className="gradient-text"> Beautiful</span>
          </h1>
          <p className="hero-subtitle">
            A modern React + TypeScript starter with Vite. Fast development, type safety,
            and a gorgeous UI out of the box.
          </p>
          <div className="hero-actions">
            <a href="#demo" className="btn btn-primary">Try the Demo</a>
            <a href="#features" className="btn btn-secondary">Learn More</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orbit">
            <div className="planet planet-1">⚛️</div>
            <div className="planet planet-2">⚡</div>
            <div className="planet planet-3">💎</div>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <h2 className="section-title">Features</h2>
        <div className="feature-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <span className="feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="demo">
        <h2 className="section-title">Interactive Demo</h2>
        <p className="demo-subtitle">Click the counter to see React state in action</p>
        <div className="counter-container">
          <button
            className="counter-btn"
            onClick={() => setCount((c) => c + 1)}
          >
            Count: {count}
          </button>
          <button
            className="reset-btn"
            onClick={() => setCount(0)}
            disabled={count === 0}
          >
            Reset
          </button>
        </div>
        <p className="counter-message">
          {count === 0 && 'Click to get started!'}
          {count > 0 && count < 10 && `Nice! You've clicked ${count} time${count > 1 ? 's' : ''}.`}
          {count >= 10 && count < 50 && '🔥 You\'re on fire!'}
          {count >= 50 && '🏆 Counter champion!'}
        </p>
      </section>

      <section id="newsletter" className="newsletter">
        <h2 className="section-title">Stay Updated</h2>
        {subscribed ? (
          <div className="success-message">
            <span className="success-icon">✅</span>
            <p>Thanks for subscribing! You'll hear from us soon.</p>
          </div>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="email-input"
            />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
        )}
      </section>

      <footer className="footer">
        <p>
          Built with React + TypeScript + Vite &middot; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}

export default App
