import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <main className="main" role="main">
      <div className="container">
        <h1>Terms of Service</h1>
        <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>

        <h2>Acceptance of Terms</h2>
        <p>By accessing and using NeuralAtlas, you accept and agree to be bound by the terms and provision of this agreement.</p>

        <h2>Use License</h2>
        <p>Permission is granted to temporarily use NeuralAtlas for personal, non-commercial transitory viewing only.</p>

        <h2>Disclaimer</h2>
        <p>The information on this website is provided on an 'as is' basis. To the fullest extent permitted by law, NeuralAtlas excludes all representations and warranties.</p>

        <h2>Limitations</h2>
        <p>In no event shall NeuralAtlas be liable for any damages arising out of the use or inability to use our services.</p>

        <h2>Contact Information</h2>
        <p>If you have any questions about these Terms of Service, please contact us.</p>

        <p><Link to="/">← Back to Home</Link></p>
      </div>
    </main>
  )
}