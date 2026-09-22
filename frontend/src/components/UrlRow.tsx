import { buildShortUrl } from '../api/client'
import type { UrlRecord } from '../types'

type UrlRowProps = {
  item: UrlRecord
  onDelete: (id: string) => void
  deleting: boolean
}

export function UrlRow({ item, onDelete, deleting }: UrlRowProps) {
  const shortUrl = buildShortUrl(item.shortCode)
  const created = new Date(item.createdAt).toLocaleString()

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete short link "${item.shortCode}"? This cannot be undone.`,
    )
    if (confirmed) {
      onDelete(item.id)
    }
  }

  return (
    <li className="url-row">
      <div className="url-meta">
        <a href={shortUrl} target="_blank" rel="noreferrer">
          {item.shortCode}
        </a>
        <span className="url-target" title={item.targetURL}>
          {item.targetURL}
        </span>
        <span className="url-date">Created {created}</span>
      </div>
      <button
        className="btn btn-danger"
        type="button"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? 'Deleting…' : 'Delete'}
      </button>
    </li>
  )
}
