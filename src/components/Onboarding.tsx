import { useState } from 'react'
import type {
  ContentType,
  DurationBucket,
  Genre,
  Topic,
  UserPreferences,
} from '../types'
import {
  CONTENT_TYPE_LABELS,
  DEFAULT_PREFERENCES,
  GENRE_LABELS,
  TOPIC_LABELS,
} from '../types'

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void
}

function toggleItem<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [draft, setDraft] = useState<UserPreferences>({
    ...DEFAULT_PREFERENCES,
  })

  const canSubmit =
    draft.topics.length > 0 &&
    draft.genres.length > 0 &&
    draft.contentTypes.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6">
      <div className="fade-up max-h-[92vh] w-full max-w-lg overflow-y-auto border border-[var(--color-line)] bg-[var(--color-stage)] p-5 shadow-2xl sm:rounded-2xl sm:p-7">
        <p className="font-display text-4xl text-[var(--color-spot)] sm:text-5xl">
          K-PLAY Finder
        </p>
        <h2 className="font-ko mt-2 text-xl font-bold text-[var(--color-cream)]">
          무엇을 먼저 볼까요?
        </h2>
        <p className="font-ko mt-1 text-sm text-[var(--color-muted)]">
          취향을 고르면 장르·유형·길이에 맞는 유튜브 영상을 추천합니다.
        </p>

        <fieldset className="mt-6 space-y-2">
          <legend className="font-ko text-sm font-semibold">관심 분야</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TOPIC_LABELS) as Topic[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    topics: toggleItem(d.topics, t),
                  }))
                }
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  draft.topics.includes(t)
                    ? 'border-[var(--color-spot)] bg-[var(--color-spot)]/20'
                    : 'border-[var(--color-line)] text-[var(--color-muted)]'
                }`}
              >
                {TOPIC_LABELS[t]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5 space-y-2">
          <legend className="font-ko text-sm font-semibold">선호 장르</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(GENRE_LABELS) as Genre[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    genres: toggleItem(d.genres, g),
                  }))
                }
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  draft.genres.includes(g)
                    ? 'border-[var(--color-spot)] bg-[var(--color-spot)]/20'
                    : 'border-[var(--color-line)] text-[var(--color-muted)]'
                }`}
              >
                {GENRE_LABELS[g]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5 space-y-2">
          <legend className="font-ko text-sm font-semibold">영상 유형</legend>
          <div className="flex flex-wrap gap-2">
            {(
              Object.keys(CONTENT_TYPE_LABELS) as ContentType[]
            )
              .filter((t) => t !== 'other')
              .map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      contentTypes: toggleItem(d.contentTypes, t),
                    }))
                  }
                  className={`rounded-md border px-3 py-1.5 text-sm ${
                    draft.contentTypes.includes(t)
                      ? 'border-[var(--color-spot)] bg-[var(--color-spot)]/20'
                      : 'border-[var(--color-line)] text-[var(--color-muted)]'
                  }`}
                >
                  {CONTENT_TYPE_LABELS[t]}
                </button>
              ))}
          </div>
        </fieldset>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="font-ko text-xs text-[var(--color-muted)]">
              영상 길이
            </span>
            <select
              className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] px-2 py-2 text-sm"
              value={draft.durationBucket}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  durationBucket: e.target.value as DurationBucket | 'any',
                }))
              }
            >
              <option value="any">상관없음</option>
              <option value="shorts">Shorts</option>
              <option value="mid">4~20분</option>
              <option value="long">20분 이상</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="font-ko text-xs text-[var(--color-muted)]">
              스포일러
            </span>
            <select
              className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] px-2 py-2 text-sm"
              value={draft.spoiler}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  spoiler: e.target.value as 'allow' | 'minimize',
                }))
              }
            >
              <option value="minimize">최소화</option>
              <option value="allow">허용</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onComplete(draft)}
          className="font-ko mt-7 w-full rounded-lg bg-[var(--color-spot)] px-4 py-3 text-sm font-bold text-white transition enabled:hover:bg-[var(--color-spot-soft)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          추천 시작하기
        </button>
      </div>
    </div>
  )
}
