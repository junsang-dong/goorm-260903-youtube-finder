import type { FilterState, UserPreferences } from '../types'
import { DEFAULT_PREFERENCES } from '../types'

export function preferencesToFilters(prefs: UserPreferences): FilterState {
  return {
    topic: 'all',
    genres: [...prefs.genres],
    contentTypes: [...prefs.contentTypes],
    freshness: prefs.freshness,
    durationBucket: prefs.durationBucket,
    minViews: prefs.minViews,
    sortBy: prefs.sortBy,
    shortsOnly: null,
  }
}

export function formatViews(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`
  if (n >= 10_000) return `${Math.round(n / 10_000)}만`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}천`
  return String(n)
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

export { DEFAULT_PREFERENCES }
