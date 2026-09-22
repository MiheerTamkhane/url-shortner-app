import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login as loginRequest } from '../api/auth'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Nav } from '../components/Nav'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const successMessage =
    typeof location.state === 'object' &&
    location.state &&
    'message' in location.state &&
    typeof (location.state as { message?: unknown }).message === 'string'
      ? (location.state as { message: string }).message
      : null

  const from =
    typeof location.state === 'object' &&
    location.state &&
    'from' in location.state &&
    typeof (location.state as { from?: unknown }).from === 'string'
      ? (location.state as { from: string }).from
      : '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const response = await loginRequest({ email: email.trim(), password })
      login(response.token)
      navigate(from || '/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <Nav variant="auth" />
      <main className="auth-main">
        <div className="panel">
          <h1>Log in</h1>
          <p className="panel-lead">Welcome back — pick up where you left off.</p>

          <p className="field-hint" style={{ marginBottom: '1rem' }}>
            Demo: <code>demo@shortly.app</code> / <code>password123</code>
          </p>

          {successMessage && (
            <div className="alert alert-success" role="status">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete="current-password"
                required
                minLength={3}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Log in'}
            </button>
          </form>

          <div className="form-footer">
            <span className="muted">New here?</span>
            <Link to="/signup">Create an account</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
