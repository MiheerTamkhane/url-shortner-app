import { useState } from 'react'
import { ApiError } from '../api/client'
import { deleteUrl } from '../api/urls'
import type { UrlRecord } from '../types'
import { UrlRow } from './UrlRow'

type UrlListProps = {
  items: UrlRecord[]
  loading: boolean
  error: string | null
  onDeleted: (id: string) => void
}

export function UrlList({ items, loading, error, onDeleted }: UrlListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setActionError(null)
    setDeletingId(id)
    try {
      await deleteUrl(id)
      onDeleted(id)
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Could not delete URL')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="panel" aria-labelledby="links-heading">
      <h2 className="section-title" id="links-heading">
        Your links
      </h2>

      {(error || actionError) && (
        <div className="alert alert-error" role="alert">
          {error || actionError}
        </div>
      )}

      {loading && <p className="muted">Loading your links…</p>}

      {!loading && !error && items.length === 0 && (
        <p className="empty-state">No short links yet — create your first one above.</p>
      )}

      {!loading && items.length > 0 && (
        <ul className="url-list">
          {items.map((item) => (
            <UrlRow
              key={item.id}
              item={item}
              deleting={deletingId === item.id}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
