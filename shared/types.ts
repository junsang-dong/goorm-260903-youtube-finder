export type Topic = 'movie' | 'netflix' | 'drama'

export type ContentType =
  | 'trailer'
  | 'review'
  | 'analysis'
  | 'interview'
  | 'summary'
  | 'other'

export type SpoilerRisk = 'low' | 'medium' | 'high'

export type Genre =
  | 'action'
  | 'thriller'
  | 'sf'
  | 'romance'
  | 'comedy'
  | 'horror'
  | 'drama'

export type DurationBucket = 'shorts' | 'mid' | 'long'

export type Freshness = 'today' | 'week' | 'month' | 'any'

export type SortBy = 'popular' | 'rising' | 'preference'

export interface TitleSeed {
  id: string
  title: string
  type: Topic
  genres: Genre[]
  keywords: string[]
}

export interface RecommendedVideo {
  videoId: string
  title: string
  channelTitle: string
  thumbnailUrl: string
  publishedAt: string

  viewCount: number
  likeCount: number
  commentCount: number
  durationSeconds: number

  topic: Topic
  titleId: string
  titleName: string
  genres: Genre[]
  contentType: ContentType
  spoilerRisk: SpoilerRisk

  popularityScore: number
  preferenceScore: number
  recommendationScore: number
  recommendationReason: string
  isShort: boolean
}

export interface UserPreferences {
  topics: Topic[]
  genres: Genre[]
  contentTypes: ContentType[]
  durationBucket: DurationBucket | 'any'
  spoiler: 'allow' | 'minimize'
  freshness: Freshness
  sortBy: SortBy
  minViews: number
  onboarded: boolean
}

export interface FilterState {
  topic: Topic | 'all'
  genres: Genre[]
  contentTypes: ContentType[]
  freshness: Freshness
  durationBucket: DurationBucket | 'any'
  minViews: number
  sortBy: SortBy
  shortsOnly: boolean | null
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  topics: ['movie', 'netflix', 'drama'],
  genres: ['action', 'thriller', 'sf', 'romance', 'comedy'],
  contentTypes: ['trailer', 'review', 'analysis', 'interview', 'summary'],
  durationBucket: 'any',
  spoiler: 'minimize',
  freshness: 'month',
  sortBy: 'preference',
  minViews: 0,
  onboarded: false,
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  trailer: '예고편',
  review: '리뷰',
  analysis: '해석',
  interview: '인터뷰',
  summary: '요약',
  other: '기타',
}

export const TOPIC_LABELS: Record<Topic, string> = {
  movie: '영화',
  netflix: '넷플릭스',
  drama: '드라마',
}

export const GENRE_LABELS: Record<Genre, string> = {
  action: '액션',
  thriller: '스릴러',
  sf: 'SF',
  romance: '로맨스',
  comedy: '코미디',
  horror: '호러',
  drama: '드라마',
}
