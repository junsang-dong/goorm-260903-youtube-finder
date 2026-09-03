import { Link, useParams } from 'react-router-dom'
import { VideoCard } from '../components/VideoCard'
import { usePreferences } from '../context/PreferenceContext'
import { useVideos } from '../context/VideosContext'
import { groupByContentType, scoreVideo } from '../lib/recommend'
import { CONTENT_TYPE_LABELS, TOPIC_LABELS } from '../types'
import titlesData from '../../data/titles.json'
import type { TitleSeed } from '../types'

const titles = titlesData as TitleSeed[]

const GROUP_ORDER = [
  'trailer',
  'review',
  'analysis',
  'interview',
  'summary',
  'shorts',
  'other',
] as const

const GROUP_LABELS: Record<(typeof GROUP_ORDER)[number], string> = {
  trailer: '공식 예고편',
  review: '스포일러 없는 리뷰',
  analysis: '심층 해석',
  interview: '배우·제작 인터뷰',
  summary: '요약',
  shorts: 'Shorts',
  other: '기타',
}

export function TitleDetailPage() {
  const { slug } = useParams()
  const { preferences } = usePreferences()
  const { videos, loading, error } = useVideos()

  const seed = titles.find((t) => t.id === slug)
  const related = videos
    .filter((v) => v.titleId === slug)
    .map((v) => scoreVideo(v, preferences))
  const groups = groupByContentType(related)

  if (!seed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="font-ko text-[var(--color-muted)]">작품을 찾을 수 없습니다.</p>
        <Link to="/" className="mt-4 inline-block text-[var(--color-gold)]">
          홈으로
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <Link
        to="/"
        className="font-ko text-sm text-[var(--color-muted)] hover:text-[var(--color-gold)]"
      >
        ← 홈
      </Link>

      <header className="fade-up mt-4 border-b border-[var(--color-line)] pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
          {TOPIC_LABELS[seed.type]}
        </p>
        <h1 className="font-ko mt-2 text-3xl font-bold sm:text-5xl">
          {seed.title}
        </h1>
        <p className="font-ko mt-3 text-sm text-[var(--color-muted)]">
          예고편·리뷰·해석·인터뷰·Shorts를 한곳에서 모아 봅니다.
        </p>
      </header>

      {loading && (
        <p className="font-ko mt-8 text-sm text-[var(--color-muted)]">불러오는 중…</p>
      )}
      {error && (
        <p className="font-ko mt-8 text-sm text-[var(--color-spot-soft)]">{error}</p>
      )}

      {!loading && related.length === 0 && (
        <p className="font-ko mt-8 rounded-xl border border-dashed border-[var(--color-line)] px-4 py-10 text-center text-sm text-[var(--color-muted)]">
          이 작품에 연결된 영상이 아직 없습니다.
        </p>
      )}

      <div className="mt-10 space-y-12">
        {GROUP_ORDER.map((key) => {
          const list = groups[key] ?? []
          if (list.length === 0) return null
          return (
            <section key={key} className="space-y-4">
              <h2 className="font-display text-3xl text-[var(--color-cream)]">
                {GROUP_LABELS[key]}
              </h2>
              {key !== 'shorts' && key !== 'other' && (
                <p className="font-ko -mt-2 text-xs text-[var(--color-muted)]">
                  {CONTENT_TYPE_LABELS[key as keyof typeof CONTENT_TYPE_LABELS] ??
                    ''}
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((v) => (
                  <VideoCard key={v.videoId} video={v} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
