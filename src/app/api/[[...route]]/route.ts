import { Redis } from '@upstash/redis/cloudflare'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

type EnvConfig = {
  UPSTASH_REDIS_REST_URL: string
  UPSTASH_REDIS_REST_TOKEN: string
}

app.use('/*', cors())
app.get('/search', async (c) => {
  try {
    const start = performance.now()
    const { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } =
      env<EnvConfig>(c)

    const redis = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    })

    const query = c.req.query('q')

    if (!query) {
      return c.json({ message: 'Query is required' }, { status: 400 })
    }

    const res = []
    const rank = await redis.zrank('terms', query)

    console.log(rank)

    if (rank !== null && rank !== undefined) {
      const results = await redis.zrange<string[]>('terms', rank, rank + 100)
      for (const result of results) {
        if (!result.startsWith(query)) {
          break
        }

        if (result.endsWith('*')) {
          res.push(result.substring(0, result.length - 1))
        }
      }
    }

    const end = performance.now()

    return c.json({
      results: res,
      duration: (end - start).toFixed(0),
    })
  } catch (error) {
    console.error(error)

    return c.json(
      { results: [], message: 'Internal server error' },
      { status: 500 },
    )
  }
})

export const GET = handle(app)
export default app as never
