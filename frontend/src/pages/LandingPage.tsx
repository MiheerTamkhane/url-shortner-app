import { Link } from 'react-router-dom'
import { Nav } from '../components/Nav'
import { useAuth } from '../auth/AuthContext'

export function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="app-shell">
      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orb" aria-hidden="true" />
        <Nav />
        <div className="hero-content">
          <p className="hero-brand">Shortly</p>
          <div className="hero-copy">
            <h1>Long links, made short.</h1>
            <p>
              Turn messy URLs into clean, shareable links you can send anywhere —
              messages, email, or social.
            </p>
            <div className="cta-group">
              {isAuthenticated ? (
                <Link className="btn btn-primary" to="/dashboard">
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link className="btn btn-primary" to="/signup">
                    Get started
                  </Link>
                  <Link className="btn btn-secondary" to="/login">
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="how-section" aria-labelledby="how-heading">
        <h2 id="how-heading">How it works</h2>
        <p>Three steps from a sprawling URL to a link worth sharing.</p>
        <ol className="how-steps">
          <li>
            <span>01</span>
            <strong>Sign up</strong>
            <p>Create a free account so your short links stay tied to you.</p>
          </li>
          <li>
            <span>02</span>
            <strong>Paste a URL</strong>
            <p>Drop in any long link and optionally pick a custom short code.</p>
          </li>
          <li>
            <span>03</span>
            <strong>Share</strong>
            <p>Copy the short link and send it — recipients land on the original.</p>
          </li>
        </ol>
      </section>
    </div>
  )
}
