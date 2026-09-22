import { apiRequest } from './client'
import type { ShortenResult, UrlRecord } from '../types'

type ShortenResponse = {
  result: ShortenResult
  message: string
}

type CodesResponse = {
  data: UrlRecord[]
}

export function shortenUrl(url: string, code?: string) {
  return apiRequest<ShortenResponse>('/shorten', {
    method: 'POST',
    auth: true,
    body: code ? { url, code } : { url },
  })
}

export function getUserUrls() {
  return apiRequest<CodesResponse>('/codes', { auth: true })
}

export function deleteUrl(id: string) {
  return apiRequest<{ message: string }>(`/${id}`, {
    method: 'DELETE',
    auth: true,
  })
}
