import { Link } from 'react-router-dom'
import type { RecommendedVideo } from '../types'
import { CONTENT_TYPE_LABELS, TOPIC_LABELS } from '../types'
import {
  formatDate,
  formatDuration,
  formatViews,
  youtubeWatchUrl,
} from '../lib/format'

interface VideoCardProps {
  video: RecommendedVideo
  showReason?: boolean
}

export function VideoCard({ video, showReason = true }: VideoCardProps) {
  return (
    <article className="group fade-up overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/80 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-spot)]/50 hover:shadow-[0_12px_40px_rgba(226,61,44,0.12)]">
      <a
        href={youtubeWatchUrl(video.videoId)}
        target="_blank"
        rel="noreferrer"
        className="block"
      >
        <div className="relative aspect-video overflow-hidden bg-black/40">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--color-muted)]">
              No thumbnail
            </div>
          )}
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium tabular-nums">
            {formatDuration(video.durationSeconds)}
          </span>
          {video.isShort && (
            <span className="absolute left-2 top-2 rounded bg-[var(--color-spot)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Shorts
            </span>
          )}
        </div>
      </a>

      <div className="space-y-2 p-3.5 sm:p-4">
        <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-gold)]">
          <span>{TOPIC_LABELS[video.topic]}</span>
          <span className="text-[var(--color-line)]">·</span>
          <span>{CONTENT_TYPE_LABELS[video.contentType]}</span>
          {video.spoilerRisk === 'high' && (
            <>
              <span className="text-[var(--color-line)]">·</span>
              <span className="text-[var(--color-spot-soft)]">스포일러</span>
            </>
          )}
        </div>

        <a
          href={youtubeWatchUrl(video.videoId)}
          target="_blank"
          rel="noreferrer"
          className="font-ko line-clamp-2 text-[15px] font-bold leading-snug text-[var(--color-cream)] transition group-hover:text-white"
        >
          {video.title}
        </a>

        <p className="font-ko text-sm text-[var(--color-muted)]">
          {video.channelTitle}
        </p>

        <p className="font-ko text-xs text-[var(--color-muted)]">
          조회 {formatViews(video.viewCount)} · 좋아요{' '}
          {formatViews(video.likeCount)} · {formatDate(video.publishedAt)}
        </p>

        <div className="flex flex-wrap gap-3 pt-1 text-xs">
          <span className="text-[var(--color-cream)]">
            인기 {(video.popularityScore * 100).toFixed(0)}
          </span>
          <span className="text-[var(--color-gold)]">
            취향 {(video.preferenceScore * 100).toFixed(0)}%
          </span>
          <span className="text-[var(--color-spot-soft)]">
            추천 {(video.recommendationScore * 100).toFixed(0)}
          </span>
        </div>

        {showReason && video.recommendationReason && (
          <p className="font-ko border-t border-[var(--color-line)]/80 pt-2 text-xs leading-relaxed text-[var(--color-muted)]">
            {video.recommendationReason}
          </p>
        )}

        <Link
          to={`/title/${video.titleId}`}
          className="font-ko inline-flex text-xs font-medium text-[var(--color-gold)] underline-offset-2 hover:underline"
        >
          {video.titleName} 작품 보기
        </Link>
      </div>
    </article>
  )
}
