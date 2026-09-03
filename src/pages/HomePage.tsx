import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FilterBar } from '../components/FilterBar'
import { Onboarding } from '../components/Onboarding'
import { VideoCard } from '../components/VideoCard'
import { usePreferences } from '../context/PreferenceContext'
import { useVideos } from '../context/VideosContext'
import { preferencesToFilters } from '../lib/format'
import {
  applyFilters,
  getTopRecommendations,
  scoreVideo,
  sortVideos,
} from '../lib/recommend'
import titlesData from '../../data/titles.json'
import type { FilterState, TitleSeed, Topic } from '../types'
import { TOPIC_LABELS } from '../types'

const titles = titlesData as TitleSeed[]

export function HomePage() {
  const { preferences, completeOnboarding, updatePreferences } =
    usePreferences()
  const { videos, loading, error, source, cached, refresh } = useVideos()
  const [filters, setFilters] = useState<FilterState>(() =>
    preferencesToFilters(preferences),
  )
  const [activeTab, setActiveTab] = useState<Topic | 'all'>('all')

  const scored = useMemo(
    () => videos.map((v) => scoreVideo(v, preferences)),
    [videos, preferences],
  )

  const recommendations = useMemo(
    () => getTopRecommendations(videos, preferences, 20),
    [videos, preferences],
  )

  const { rising, popular } = useMemo(() => {
    const risingList = sortVideos(scored, 'rising').slice(0, 4)
    const risingIds = new Set(risingList.map((v) => v.videoId))
    const popularList = sortVideos(scored, 'popular')
      .filter((v) => !risingIds.has(v.videoId))
      .slice(0, 4)
    return { rising: risingList, popular: popularList }
  }, [scored])

  const filtered = useMemo(() => {
    const next = {
      ...filters,
      topic: activeTab === 'all' ? filters.topic : activeTab,
    }
    return sortVideos(applyFilters(scored, next), next.sortBy)
  }, [scored, filters, activeTab])

  const titleList = titles

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      {!preferences.onboarded && (
        <Onboarding onComplete={completeOnboarding} />
      )}

      <header className="fade-up relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 px-5 py-8 sm:px-8 sm:py-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(115deg, rgba(226,61,44,0.25) 0%, transparent 42%), repeating-linear-gradient(-12deg, transparent, transparent 18px, rgba(255,255,255,0.02) 18px, rgba(255,255,255,0.02) 19px)',
          }}
        />
        <div className="relative">
          <p className="font-display text-5xl text-[var(--color-spot)] sm:text-7xl md:text-8xl">
            K-PLAY Finder
          </p>
          <p className="font-ko fade-up-delay mt-3 max-w-xl text-base text-[var(--color-cream)]/90 sm:text-lg">
            최근 개봉 영화·넷플릭스·드라마 관련 유튜브 영상을 취향에 맞게
            골라 드립니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                updatePreferences({ onboarded: false })
              }
              className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-cream)] hover:border-[var(--color-gold)]"
            >
              취향 다시 설정
            </button>
            <button
              type="button"
              onClick={refresh}
              className="rounded-lg bg-[var(--color-spot)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-spot-soft)]"
            >
              새로고침
            </button>
          </div>
          {(source || cached) && (
            <p className="font-ko mt-3 text-xs text-[var(--color-muted)]">
              데이터 소스: {source}
              {cached ? ' (캐시)' : ''} · {videos.length}개 영상
            </p>
          )}
        </div>
      </header>

      {loading && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="shimmer aspect-[4/5] rounded-xl border border-[var(--color-line)]"
            />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="font-ko mt-8 rounded-xl border border-[var(--color-spot)]/40 bg-[var(--color-spot)]/10 p-5 text-sm">
          <p className="font-bold text-[var(--color-spot-soft)]">불러오기 실패</p>
          <p className="mt-1 text-[var(--color-cream)]">{error}</p>
          <p className="mt-2 text-[var(--color-muted)]">
            `.env`에 `YOUTUBE_API_KEY`를 넣거나 mock 데이터로 확인하세요.
          </p>
          <button
            type="button"
            onClick={refresh}
            className="mt-3 rounded-md border border-[var(--color-line)] px-3 py-1.5 text-xs"
          >
            다시 시도
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="mt-10 space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl text-[var(--color-cream)] sm:text-4xl">
                  For You
                </h2>
                <p className="font-ko text-sm text-[var(--color-muted)]">
                  취향 기반 상위 20개 추천
                </p>
              </div>
            </div>
            {recommendations.length === 0 ? (
              <EmptyState message="조건에 맞는 추천이 없습니다. 필터를 넓혀 보세요." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((v) => (
                  <VideoCard key={v.videoId} video={v} />
                ))}
              </div>
            )}
          </section>

          <section className="mt-12 space-y-4">
            <h2 className="font-display text-3xl text-[var(--color-cream)] sm:text-4xl">
              Rising
            </h2>
            <p className="font-ko -mt-2 text-sm text-[var(--color-muted)]">
              이번 주 급상승 (서비스 추정치)
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {rising.map((v) => (
                <VideoCard key={`rise-${v.videoId}`} video={v} showReason={false} />
              ))}
            </div>
          </section>

          <section className="mt-12 space-y-4">
            <h2 className="font-display text-3xl text-[var(--color-cream)] sm:text-4xl">
              Popular
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {popular.map((v) => (
                <VideoCard key={`pop-${v.videoId}`} video={v} showReason={false} />
              ))}
            </div>
          </section>

          <section className="mt-12 space-y-4">
            <h2 className="font-display text-3xl text-[var(--color-cream)] sm:text-4xl">
              Titles
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {titleList.map((t) => (
                <Link
                  key={t.id}
                  to={`/title/${t.id}`}
                  className="font-ko shrink-0 rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-sm hover:border-[var(--color-gold)]"
                >
                  {t.title}
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-12 space-y-5">
            <div className="flex flex-wrap gap-2">
              <TabChip
                active={activeTab === 'all'}
                onClick={() => setActiveTab('all')}
                label="전체"
              />
              {(Object.keys(TOPIC_LABELS) as Topic[]).map((t) => (
                <TabChip
                  key={t}
                  active={activeTab === t}
                  onClick={() => setActiveTab(t)}
                  label={TOPIC_LABELS[t]}
                />
              ))}
            </div>

            <FilterBar
              filters={filters}
              onChange={(next) => {
                setFilters(next)
                updatePreferences({
                  genres: next.genres,
                  contentTypes: next.contentTypes,
                  freshness: next.freshness,
                  durationBucket: next.durationBucket,
                  sortBy: next.sortBy,
                  minViews: next.minViews,
                })
              }}
            />

            {filtered.length === 0 ? (
              <EmptyState message="필터 결과가 비어 있습니다." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((v) => (
                  <VideoCard key={`f-${v.videoId}`} video={v} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function TabChip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-[var(--color-spot)] text-white'
          : 'border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-cream)]'
      }`}
    >
      {label}
    </button>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="font-ko rounded-xl border border-dashed border-[var(--color-line)] px-4 py-10 text-center text-sm text-[var(--color-muted)]">
      {message}
    </div>
  )
}
