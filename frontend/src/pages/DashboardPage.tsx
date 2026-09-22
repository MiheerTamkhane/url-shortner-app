import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { getUserUrls } from '../api/urls'
import { useAuth } from '../auth/AuthContext'
import { ShortenForm } from '../components/ShortenForm'
import { UrlList } from '../components/UrlList'
import type { ShortenResult, UrlRecord } from '../types'

export function DashboardPage() {
  const { email, logout } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<UrlRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await getUserUrls()
        if (!cancelled) {
          setItems(response.data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load links')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  function handleCreated(result: ShortenResult) {
    setItems((current) => {
      const exists = current.some((item) => item.id === result.id)
      if (exists) return current

      const optimistic: UrlRecord = {
        id: result.id,
        userId: '',
        targetURL: result.targetURL,
        shortCode: result.shortCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return [optimistic, ...current]
    })
  }

  function handleDeleted(id: string) {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <Link className="brand-mark" to="/">
          Shortly
        </Link>
        <div className="dashboard-nav-actions">
          {email && <span className="user-chip">{email}</span>}
          <button className="btn btn-secondary" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-stack">
          <ShortenForm onCreated={handleCreated} />
          <UrlList
            items={items}
            loading={loading}
            error={error}
            onDeleted={handleDeleted}
          />
        </div>
      </main>
    </div>
  )
}
