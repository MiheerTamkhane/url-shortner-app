import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

type NavProps = {
  variant?: 'landing' | 'auth'
}

export function Nav({ variant = 'landing' }: NavProps) {
  const { isAuthenticated } = useAuth()

  return (
    <nav className="site-nav" aria-label="Primary">
      <Link className="brand-mark" to="/">
        Shortly
      </Link>
      <div className="nav-actions">
        {isAuthenticated ? (
          <Link className="btn btn-primary" to="/dashboard">
            Dashboard
          </Link>
        ) : (
          <>
            {variant === 'landing' && (
              <Link className="btn btn-secondary" to="/login">
                Log in
              </Link>
            )}
            <Link className="btn btn-primary" to="/signup">
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
