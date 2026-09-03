import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { RecommendedVideo } from '../types'

interface VideosResponse {
  videos: RecommendedVideo[]
  cached: boolean
  source: 'youtube' | 'cache' | 'mock'
  count: number
  titles: number
  error?: string
}

interface VideosContextValue {
  videos: RecommendedVideo[]
  loading: boolean
  error: string | null
  source: VideosResponse['source'] | null
  cached: boolean
  refresh: () => void
}

const VideosContext = createContext<VideosContextValue | null>(null)

export function VideosProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<RecommendedVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<VideosResponse['source'] | null>(null)
  const [cached, setCached] = useState(false)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => {
    setTick((t) => t + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const qs = tick > 0 ? '?refresh=1' : ''
        const res = await fetch(`/api/videos${qs}`, {
          signal: controller.signal,
        })
        const data = (await res.json()) as VideosResponse
        if (!res.ok) {
          throw new Error(data.error ?? `요청 실패 (${res.status})`)
        }
        if (!cancelled) {
          setVideos(data.videos ?? [])
          setSource(data.source)
          setCached(Boolean(data.cached))
        }
      } catch (err) {
        if (cancelled || (err as Error).name === 'AbortError') return
        setError((err as Error).message || '영상을 불러오지 못했습니다.')
        setVideos([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [tick])

  const value = useMemo(
    () => ({ videos, loading, error, source, cached, refresh }),
    [videos, loading, error, source, cached, refresh],
  )

  return (
    <VideosContext.Provider value={value}>{children}</VideosContext.Provider>
  )
}

export function useVideos() {
  const ctx = useContext(VideosContext)
  if (!ctx) throw new Error('useVideos must be used within VideosProvider')
  return ctx
}
