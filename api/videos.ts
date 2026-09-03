import type { VercelRequest, VercelResponse } from '@vercel/node'
import { collectVideos } from '../shared/collectVideos'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const forceRefresh = req.query.refresh === '1'
    const result = await collectVideos({ forceRefresh })
    return res.status(200).json({
      videos: result.videos,
      cached: result.cached,
      source: result.source,
      count: result.videos.length,
      titles: [...new Set(result.videos.map((v) => v.titleId))].length,
    })
  } catch (err) {
    const error = err as Error & { status?: number; reason?: string }
    const status = error.status ?? 500
    return res.status(status).json({
      error: error.message,
      reason: error.reason,
    })
  }
}
