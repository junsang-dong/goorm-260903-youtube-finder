import type {
  ContentType,
  DurationBucket,
  FilterState,
  Freshness,
  Genre,
  RecommendedVideo,
  SortBy,
  Topic,
  UserPreferences,
} from '../types'

function ageInDays(publishedAt: string, now = Date.now()): number {
  return Math.max((now - new Date(publishedAt).getTime()) / 86_400_000, 0)
}

function durationMatches(
  seconds: number,
  bucket: DurationBucket | 'any',
): boolean {
  if (bucket === 'any') return true
  if (bucket === 'shorts') return seconds > 0 && seconds <= 60
  if (bucket === 'mid') return seconds > 60 && seconds <= 20 * 60
  return seconds > 20 * 60
}

function freshnessMatches(publishedAt: string, freshness: Freshness): boolean {
  if (freshness === 'any') return true
  const age = ageInDays(publishedAt)
  if (freshness === 'today') return age <= 1
  if (freshness === 'week') return age <= 7
  return age <= 30
}

export function computePreferenceScore(
  video: RecommendedVideo,
  prefs: UserPreferences,
): number {
  let score = 0
  let weight = 0

  weight += 1
  score += prefs.topics.includes(video.topic) ? 1 : 0

  weight += 1
  const genreHit = video.genres.some((g) => prefs.genres.includes(g))
  score += genreHit ? 1 : 0

  weight += 1
  const typeOk =
    video.contentType === 'other'
      ? 0.4
      : prefs.contentTypes.includes(video.contentType)
        ? 1
        : 0
  score += typeOk

  weight += 1
  score += durationMatches(video.durationSeconds, prefs.durationBucket) ? 1 : 0.3

  weight += 1
  if (prefs.spoiler === 'minimize') {
    score += video.spoilerRisk === 'low' ? 1 : video.spoilerRisk === 'medium' ? 0.4 : 0
  } else {
    score += 1
  }

  return score / weight
}

function channelTrustScore(channelTitle: string): number {
  const trusted = ['공식', 'official', '넷플릭스', 'netflix', 'cj enm', '롯데']
  const lower = channelTitle.toLowerCase()
  return trusted.some((t) => lower.includes(t)) ? 1 : 0.5
}

export function buildRecommendationReason(
  video: RecommendedVideo,
  prefs: UserPreferences,
): string {
  const age = ageInDays(video.publishedAt)
  const when =
    age <= 1 ? '오늘' : age <= 7 ? '최근 7일 내' : age <= 30 ? '최근 30일 내' : '이전에'
  const genre =
    video.genres.find((g) => prefs.genres.includes(g)) ?? video.genres[0]
  const genreLabel: Record<Genre, string> = {
    action: '액션',
    thriller: '스릴러',
    sf: 'SF',
    romance: '로맨스',
    comedy: '코미디',
    horror: '호러',
    drama: '드라마',
  }
  const typeLabel: Record<ContentType, string> = {
    trailer: '예고편',
    review: '리뷰',
    analysis: '해석',
    interview: '인터뷰',
    summary: '요약',
    other: '관련 영상',
  }
  const topicLabel: Record<Topic, string> = {
    movie: '영화',
    netflix: '넷플릭스',
    drama: '드라마',
  }
  const lengthHint =
    video.isShort
      ? 'Shorts'
      : video.durationSeconds <= 20 * 60
        ? '중편'
        : '장편'

  return `${when} 등록된 ${genreLabel[genre] ?? ''} ${topicLabel[video.topic]} ${typeLabel[video.contentType]}이며, ${lengthHint} 길이와 선택하신 취향과 잘 맞습니다.`
}

export function scoreVideo(
  video: RecommendedVideo,
  prefs: UserPreferences,
): RecommendedVideo {
  const preferenceScore = computePreferenceScore(video, prefs)
  const age = Math.max(ageInDays(video.publishedAt), 1)
  const freshnessScore = 1 / (age + 1)
  const velocityScore = Math.log10(video.viewCount / age + 1) / 6
  const engagementRate =
    (video.likeCount + video.commentCount * 2) / Math.max(video.viewCount, 1)
  const engagementScore = Math.min(engagementRate * 25, 1)
  const trust = channelTrustScore(video.channelTitle)

  const recommendationScore =
    preferenceScore * 0.35 +
    freshnessScore * 0.25 +
    Math.min(velocityScore, 1) * 0.2 +
    engagementScore * 0.15 +
    trust * 0.05

  return {
    ...video,
    preferenceScore,
    recommendationScore,
    recommendationReason: buildRecommendationReason(video, prefs),
  }
}

export function applyFilters(
  videos: RecommendedVideo[],
  filters: FilterState,
): RecommendedVideo[] {
  return videos.filter((v) => {
    if (filters.topic !== 'all' && v.topic !== filters.topic) return false
    if (
      filters.genres.length > 0 &&
      !v.genres.some((g) => filters.genres.includes(g))
    ) {
      return false
    }
    if (
      filters.contentTypes.length > 0 &&
      v.contentType !== 'other' &&
      !filters.contentTypes.includes(v.contentType)
    ) {
      return false
    }
    if (!freshnessMatches(v.publishedAt, filters.freshness)) return false
    if (!durationMatches(v.durationSeconds, filters.durationBucket)) return false
    if (v.viewCount < filters.minViews) return false
    if (filters.shortsOnly === true && !v.isShort) return false
    if (filters.shortsOnly === false && v.isShort) return false
    return true
  })
}

export function sortVideos(
  videos: RecommendedVideo[],
  sortBy: SortBy,
): RecommendedVideo[] {
  const copy = [...videos]
  if (sortBy === 'popular') {
    return copy.sort((a, b) => b.popularityScore - a.popularityScore)
  }
  if (sortBy === 'rising') {
    return copy.sort((a, b) => {
      const va =
        Math.log10(a.viewCount / Math.max(ageInDays(a.publishedAt), 1) + 1)
      const vb =
        Math.log10(b.viewCount / Math.max(ageInDays(b.publishedAt), 1) + 1)
      return vb - va
    })
  }
  return copy.sort((a, b) => b.recommendationScore - a.recommendationScore)
}

export function getTopRecommendations(
  videos: RecommendedVideo[],
  prefs: UserPreferences,
  limit = 20,
): RecommendedVideo[] {
  const scored = videos.map((v) => scoreVideo(v, prefs))
  const filters: FilterState = {
    topic: 'all',
    genres: prefs.genres,
    contentTypes: prefs.contentTypes,
    freshness: prefs.freshness,
    durationBucket: prefs.durationBucket,
    minViews: prefs.minViews,
    sortBy: prefs.sortBy,
    shortsOnly: null,
  }
  const filtered = applyFilters(scored, filters)
  return sortVideos(filtered, prefs.sortBy).slice(0, limit)
}

export function groupByContentType(
  videos: RecommendedVideo[],
): Record<string, RecommendedVideo[]> {
  const groups: Record<string, RecommendedVideo[]> = {
    trailer: [],
    review: [],
    analysis: [],
    interview: [],
    summary: [],
    shorts: [],
    other: [],
  }
  for (const v of videos) {
    if (v.isShort) groups.shorts.push(v)
    else groups[v.contentType]?.push(v)
  }
  return groups
}
