import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ageInDays,
  basePopularityScore,
  classifyContentType,
  classifySpoilerRisk,
  parseDurationSeconds,
} from './classify'
import type { RecommendedVideo, TitleSeed } from './types'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const CACHE_TTL_MS = 45 * 60 * 1000
const MAX_RESULTS_PER_KEYWORD = 4
const TARGET_PER_TITLE = 10

interface CacheEntry {
  expiresAt: number
  videos: RecommendedVideo[]
}

let memoryCache: CacheEntry | null = null

export function loadTitles(): TitleSeed[] {
  const raw = readFileSync(join(ROOT, 'data', 'titles.json'), 'utf-8')
  return JSON.parse(raw) as TitleSeed[]
}

async function youtubeGet<T>(
  path: string,
  params: Record<string, string>,
  apiKey: string,
): Promise<T> {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  url.searchParams.set('key', apiKey)

  const res = await fetch(url)
  const data = (await res.json()) as T & {
    error?: { code?: number; message?: string; errors?: { reason?: string }[] }
  }

  if (!res.ok || data.error) {
    const reason = data.error?.errors?.[0]?.reason
    const message = data.error?.message ?? `YouTube API error (${res.status})`
    const err = new Error(message) as Error & {
      status: number
      reason?: string
    }
    err.status =
      reason === 'quotaExceeded' || reason === 'dailyLimitExceeded'
        ? 429
        : res.status || 502
    err.reason = reason
    throw err
  }

  return data
}

interface SearchItem {
  id?: { videoId?: string }
  snippet?: { title?: string }
}

interface VideoItem {
  id: string
  snippet?: {
    title?: string
    description?: string
    channelTitle?: string
    publishedAt?: string
    thumbnails?: {
      medium?: { url?: string }
      high?: { url?: string }
      default?: { url?: string }
    }
    tags?: string[]
  }
  statistics?: {
    viewCount?: string
    likeCount?: string
    commentCount?: string
  }
  contentDetails?: { duration?: string }
  status?: { embeddable?: boolean }
}

async function searchVideoIds(
  query: string,
  apiKey: string,
): Promise<string[]> {
  const data = await youtubeGet<{ items?: SearchItem[] }>(
    'search',
    {
      part: 'snippet',
      q: query,
      type: 'video',
      regionCode: 'KR',
      relevanceLanguage: 'ko',
      order: 'relevance',
      maxResults: String(MAX_RESULTS_PER_KEYWORD),
      videoEmbeddable: 'true',
    },
    apiKey,
  )

  return (data.items ?? [])
    .map((item) => item.id?.videoId)
    .filter((id): id is string => Boolean(id))
}

async function fetchVideoDetails(
  ids: string[],
  apiKey: string,
): Promise<VideoItem[]> {
  if (ids.length === 0) return []
  const chunks: string[][] = []
  for (let i = 0; i < ids.length; i += 50) {
    chunks.push(ids.slice(i, i + 50))
  }

  const results: VideoItem[] = []
  for (const chunk of chunks) {
    const data = await youtubeGet<{ items?: VideoItem[] }>(
      'videos',
      {
        part: 'snippet,statistics,contentDetails,status',
        id: chunk.join(','),
      },
      apiKey,
    )
    results.push(...(data.items ?? []))
  }
  return results
}

function toRecommended(
  item: VideoItem,
  seed: TitleSeed,
): RecommendedVideo | null {
  if (item.status?.embeddable === false) return null

  const title = item.snippet?.title ?? ''
  const description = item.snippet?.description ?? ''
  const channelTitle = item.snippet?.channelTitle ?? ''
  const publishedAt = item.snippet?.publishedAt ?? new Date().toISOString()
  const viewCount = Number(item.statistics?.viewCount ?? 0)
  const likeCount = Number(item.statistics?.likeCount ?? 0)
  const commentCount = Number(item.statistics?.commentCount ?? 0)
  const durationSeconds = parseDurationSeconds(
    item.contentDetails?.duration ?? 'PT0S',
  )
  const thumbnailUrl =
    item.snippet?.thumbnails?.medium?.url ??
    item.snippet?.thumbnails?.high?.url ??
    item.snippet?.thumbnails?.default?.url ??
    ''

  const contentType = classifyContentType(title, description, channelTitle)
  const spoilerRisk = classifySpoilerRisk(title, description)
  const popularityScore = basePopularityScore(
    viewCount,
    likeCount,
    commentCount,
    publishedAt,
  )

  return {
    videoId: item.id,
    title,
    channelTitle,
    thumbnailUrl,
    publishedAt,
    viewCount,
    likeCount,
    commentCount,
    durationSeconds,
    topic: seed.type,
    titleId: seed.id,
    titleName: seed.title,
    genres: seed.genres,
    contentType,
    spoilerRisk,
    popularityScore,
    preferenceScore: 0,
    recommendationScore: popularityScore,
    recommendationReason: '',
    isShort: durationSeconds > 0 && durationSeconds <= 60,
  }
}

function loadMockVideos(): RecommendedVideo[] {
  try {
    const raw = readFileSync(join(ROOT, 'data', 'mock-videos.json'), 'utf-8')
    return JSON.parse(raw) as RecommendedVideo[]
  } catch {
    return []
  }
}

export async function collectVideos(options?: {
  forceRefresh?: boolean
  useMockFallback?: boolean
}): Promise<{ videos: RecommendedVideo[]; cached: boolean; source: 'youtube' | 'cache' | 'mock' }> {
  const apiKey = process.env.YOUTUBE_API_KEY
  const now = Date.now()

  if (
    !options?.forceRefresh &&
    memoryCache &&
    memoryCache.expiresAt > now
  ) {
    return { videos: memoryCache.videos, cached: true, source: 'cache' }
  }

  if (!apiKey) {
    const mock = loadMockVideos()
    if (mock.length > 0 || options?.useMockFallback !== false) {
      if (mock.length === 0) {
        throw Object.assign(
          new Error(
            'YOUTUBE_API_KEY가 없고 mock-videos.json도 비어 있습니다. .env에 키를 설정하거나 mock 데이터를 준비하세요.',
          ),
          { status: 503 },
        )
      }
      memoryCache = { videos: mock, expiresAt: now + CACHE_TTL_MS }
      return { videos: mock, cached: false, source: 'mock' }
    }
    throw Object.assign(new Error('YOUTUBE_API_KEY가 설정되지 않았습니다.'), {
      status: 503,
    })
  }

  const titles = loadTitles()
  const videos: RecommendedVideo[] = []
  const seen = new Set<string>()

  for (const seed of titles) {
    const ids: string[] = []
    for (const keyword of seed.keywords) {
      if (ids.length >= TARGET_PER_TITLE) break
      try {
        const found = await searchVideoIds(keyword, apiKey)
        for (const id of found) {
          if (!seen.has(id) && !ids.includes(id)) {
            ids.push(id)
          }
          if (ids.length >= TARGET_PER_TITLE) break
        }
      } catch (err) {
        // If quota fails mid-way, return what we have if any; else rethrow
        if (videos.length === 0 && ids.length === 0) throw err
        break
      }
    }

    const uniqueIds = ids.filter((id) => !seen.has(id)).slice(0, TARGET_PER_TITLE)
    uniqueIds.forEach((id) => seen.add(id))

    try {
      const details = await fetchVideoDetails(uniqueIds, apiKey)
      for (const item of details) {
        const mapped = toRecommended(item, seed)
        if (mapped) videos.push(mapped)
      }
    } catch (err) {
      if (videos.length === 0) throw err
      break
    }
  }

  if (videos.length === 0) {
    const mock = loadMockVideos()
    if (mock.length > 0) {
      memoryCache = { videos: mock, expiresAt: now + CACHE_TTL_MS }
      return { videos: mock, cached: false, source: 'mock' }
    }
    throw Object.assign(new Error('수집된 영상이 없습니다.'), { status: 502 })
  }

  memoryCache = { videos, expiresAt: now + CACHE_TTL_MS }
  return { videos, cached: false, source: 'youtube' }
}

export function clearVideoCache(): void {
  memoryCache = null
}

export { ageInDays }
