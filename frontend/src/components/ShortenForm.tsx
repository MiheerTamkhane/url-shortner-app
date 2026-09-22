import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { shortenUrl } from '../api/urls'
import { buildShortUrl } from '../api/client'
import type { ShortenResult } from '../types'

type ShortenFormProps = {
  onCreated: (result: ShortenResult) => void
}

export function ShortenForm({ onCreated }: ShortenFormProps) {
  const [url, setUrl] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ShortenResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setCopied(false)
    setSubmitting(true)

    try {
      const response = await shortenUrl(url.trim(), code.trim() || undefined)
      setResult(response.result)
      onCreated(response.result)
      setUrl('')
      setCode('')
    } catch (err) {
      setResult(null)
      setError(err instanceof ApiError ? err.message : 'Could not shorten URL')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCopy() {
    if (!result) return
    const shortUrl = buildShortUrl(result.shortCode)
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopied(true)
    } catch {
      setError('Could not copy to clipboard')
    }
  }

  return (
    <section className="panel" aria-labelledby="shorten-heading">
      <h2 className="section-title" id="shorten-heading">
        Shorten a link
      </h2>
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="target-url">Long URL</label>
          <input
            id="target-url"
            className="input"
            type="url"
            required
            placeholder="https://example.com/very/long/path"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="custom-code">Custom code (optional)</label>
          <input
            id="custom-code"
            className="input"
            type="text"
            maxLength={55}
            placeholder="my-link"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <span className="field-hint">Leave blank to generate one automatically.</span>
        </div>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Shortening…' : 'Shorten URL'}
        </button>
      </form>

      {result && (
        <div className="result-box" role="status">
          <p>Your short link is ready:</p>
          <code>{buildShortUrl(result.shortCode)}</code>
          <div className="result-actions">
            <button className="btn btn-secondary" type="button" onClick={handleCopy}>
              {copied ? 'Copied' : 'Copy'}
            </button>
            <a
              className="btn btn-ghost"
              href={buildShortUrl(result.shortCode)}
              target="_blank"
              rel="noreferrer"
            >
              Open
            </a>
          </div>
        </div>
      )}
    </section>
  )
}
