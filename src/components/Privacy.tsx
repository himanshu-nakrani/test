import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <main className="main" role="main">
      <div className="container">
        <h1>Privacy Policy</h1>
        <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>

        <h2>Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account or use our services.</p>

        <h2>How We Use Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services.</p>

        <h2>Information Sharing</h2>
        <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.</p>

        <h2>Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information.</p>

        <h2>Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us.</p>

        <p><Link to="/">← Back to Home</Link></p>
      </div>
    </main>
  )
}