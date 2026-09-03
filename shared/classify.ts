import type { ContentType, SpoilerRisk } from './types'

const TRAILER = ['공식', '예고편', 'trailer', 'teaser', '티저']
const REVIEW = ['리뷰', '후기', 'review']
const ANALYSIS = ['해석', '분석', '결말', '떡밥']
const SUMMARY = ['요약', '몰아보기', '몇 분 만에', '총정리']
const INTERVIEW = ['인터뷰', '제작기', '비하인드', '인터뷰']
const SPOILER_HIGH = ['결말', '엔딩', '범인', '반전', '스포']
const SPOILER_MED = ['해석', '분석', '떡밥', '복선']

function includesAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase()
  return keywords.some((k) => lower.includes(k.toLowerCase()))
}

export function classifyContentType(
  title: string,
  description = '',
  channelTitle = '',
): ContentType {
  const blob = `${title} ${description} ${channelTitle}`
  if (includesAny(blob, TRAILER)) return 'trailer'
  if (includesAny(blob, INTERVIEW)) return 'interview'
  if (includesAny(blob, SUMMARY)) return 'summary'
  if (includesAny(blob, ANALYSIS)) return 'analysis'
  if (includesAny(blob, REVIEW)) return 'review'
  return 'other'
}

export function classifySpoilerRisk(
  title: string,
  description = '',
): SpoilerRisk {
  const blob = `${title} ${description}`
  if (includesAny(blob, SPOILER_HIGH)) return 'high'
  if (includesAny(blob, SPOILER_MED)) return 'medium'
  return 'low'
}

/** ISO 8601 duration (PT#H#M#S) → seconds */
export function parseDurationSeconds(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = Number(match[1] ?? 0)
  const minutes = Number(match[2] ?? 0)
  const seconds = Number(match[3] ?? 0)
  return hours * 3600 + minutes * 60 + seconds
}

export function ageInDays(publishedAt: string, now = Date.now()): number {
  const published = new Date(publishedAt).getTime()
  return Math.max((now - published) / (1000 * 60 * 60 * 24), 0)
}

/**
 * 업로드 시점에 따른 최신성 가중치.
 * 3개월 > 6개월 > 1년 > 그 이전 순으로 높은 점수.
 */
export function recencyBoost(ageDays: number): number {
  if (ageDays <= 90) return 1
  if (ageDays <= 180) return 0.72
  if (ageDays <= 365) return 0.42
  return 0.08
}

export function basePopularityScore(
  viewCount: number,
  likeCount: number,
  commentCount: number,
  publishedAt: string,
): number {
  const age = Math.max(ageInDays(publishedAt), 1)
  const velocity = Math.log10(viewCount / age + 1)
  const engagement = (likeCount + commentCount * 2) / Math.max(viewCount, 1)
  const freshness = recencyBoost(age)
  // 최신 영상이 Popular에 더 잘 오도록 freshness 비중을 높임
  return (
    Math.min(velocity / 6, 1) * 0.3 +
    Math.min(engagement * 20, 1) * 0.2 +
    freshness * 0.5
  )
}
