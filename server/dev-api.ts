import 'dotenv/config'
import { createServer } from 'node:http'
import { collectVideos } from '../shared/collectVideos.ts'

const PORT = Number(process.env.API_PORT ?? 3001)

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)

  if (url.pathname !== '/api/videos') {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not Found' }))
    return
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Method Not Allowed' }))
    return
  }

  try {
    const forceRefresh = url.searchParams.get('refresh') === '1'
    const result = await collectVideos({ forceRefresh })
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        videos: result.videos,
        cached: result.cached,
        source: result.source,
        count: result.videos.length,
        titles: [...new Set(result.videos.map((v) => v.titleId))].length,
      }),
    )
  } catch (err) {
    const error = err as Error & { status?: number; reason?: string }
    const status = error.status ?? 500
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        error: error.message,
        reason: error.reason,
      }),
    )
  }
})

server.listen(PORT, () => {
  console.log(`[K-PLAY API] http://localhost:${PORT}/api/videos`)
})
