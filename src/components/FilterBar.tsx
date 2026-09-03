import type { ReactNode } from 'react'
import type { ContentType, DurationBucket, FilterState, Freshness, Genre, SortBy, Topic } from '../types'
import {
  CONTENT_TYPE_LABELS,
  GENRE_LABELS,
  TOPIC_LABELS,
} from '../types'

interface FilterBarProps {
  filters: FilterState
  onChange: (next: FilterState) => void
}

const ALL_GENRES = Object.keys(GENRE_LABELS) as Genre[]
const ALL_TYPES = (Object.keys(CONTENT_TYPE_LABELS) as ContentType[]).filter(
  (t) => t !== 'other',
)

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
        active
          ? 'border-[var(--color-spot)] bg-[var(--color-spot)]/20 text-[var(--color-cream)]'
          : 'border-[var(--color-line)] bg-transparent text-[var(--color-muted)] hover:border-[var(--color-muted)]'
      }`}
    >
      {children}
    </button>
  )
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const toggleGenre = (g: Genre) => {
    const has = filters.genres.includes(g)
    onChange({
      ...filters,
      genres: has
        ? filters.genres.filter((x) => x !== g)
        : [...filters.genres, g],
    })
  }

  const toggleType = (t: ContentType) => {
    const has = filters.contentTypes.includes(t)
    onChange({
      ...filters,
      contentTypes: has
        ? filters.contentTypes.filter((x) => x !== t)
        : [...filters.contentTypes, t],
    })
  }

  return (
    <section className="space-y-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-ko text-sm font-bold text-[var(--color-cream)]">
          취향 필터
        </h2>
        <p className="text-[10px] text-[var(--color-muted)]">
          급상승은 조회수÷경과시간 기반 추정치입니다
        </p>
      </div>

      <div className="space-y-2">
        <p className="font-ko text-xs text-[var(--color-muted)]">플랫폼</p>
        <div className="flex flex-wrap gap-2">
          <Chip
            active={filters.topic === 'all'}
            onClick={() => onChange({ ...filters, topic: 'all' })}
          >
            전체
          </Chip>
          {(Object.keys(TOPIC_LABELS) as Topic[]).map((t) => (
            <Chip
              key={t}
              active={filters.topic === t}
              onClick={() => onChange({ ...filters, topic: t })}
            >
              {TOPIC_LABELS[t]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-ko text-xs text-[var(--color-muted)]">장르</p>
        <div className="flex flex-wrap gap-2">
          {ALL_GENRES.map((g) => (
            <Chip
              key={g}
              active={filters.genres.includes(g)}
              onClick={() => toggleGenre(g)}
            >
              {GENRE_LABELS[g]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-ko text-xs text-[var(--color-muted)]">영상 유형</p>
        <div className="flex flex-wrap gap-2">
          {ALL_TYPES.map((t) => (
            <Chip
              key={t}
              active={filters.contentTypes.includes(t)}
              onClick={() => toggleType(t)}
            >
              {CONTENT_TYPE_LABELS[t]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1.5">
          <span className="font-ko text-xs text-[var(--color-muted)]">최신성</span>
          <select
            className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] px-2 py-2 text-sm"
            value={filters.freshness}
            onChange={(e) =>
              onChange({
                ...filters,
                freshness: e.target.value as Freshness,
              })
            }
          >
            <option value="any">전체</option>
            <option value="today">오늘</option>
            <option value="week">이번 주</option>
            <option value="month">최근 30일</option>
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="font-ko text-xs text-[var(--color-muted)]">영상 길이</span>
          <select
            className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] px-2 py-2 text-sm"
            value={filters.durationBucket}
            onChange={(e) =>
              onChange({
                ...filters,
                durationBucket: e.target.value as DurationBucket | 'any',
              })
            }
          >
            <option value="any">전체</option>
            <option value="shorts">Shorts</option>
            <option value="mid">4~20분</option>
            <option value="long">20분 이상</option>
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="font-ko text-xs text-[var(--color-muted)]">정렬</span>
          <select
            className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] px-2 py-2 text-sm"
            value={filters.sortBy}
            onChange={(e) =>
              onChange({ ...filters, sortBy: e.target.value as SortBy })
            }
          >
            <option value="preference">취향 일치</option>
            <option value="popular">인기</option>
            <option value="rising">급상승</option>
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="font-ko text-xs text-[var(--color-muted)]">
            최소 조회수
          </span>
          <select
            className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] px-2 py-2 text-sm"
            value={filters.minViews}
            onChange={(e) =>
              onChange({ ...filters, minViews: Number(e.target.value) })
            }
          >
            <option value={0}>제한 없음</option>
            <option value={10000}>1만+</option>
            <option value={100000}>10만+</option>
            <option value={1000000}>100만+</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip
          active={filters.shortsOnly === null}
          onClick={() => onChange({ ...filters, shortsOnly: null })}
        >
          Shorts+일반
        </Chip>
        <Chip
          active={filters.shortsOnly === true}
          onClick={() => onChange({ ...filters, shortsOnly: true })}
        >
          Shorts만
        </Chip>
        <Chip
          active={filters.shortsOnly === false}
          onClick={() => onChange({ ...filters, shortsOnly: false })}
        >
          일반만
        </Chip>
      </div>
    </section>
  )
}
