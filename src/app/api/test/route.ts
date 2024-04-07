import { kv } from '@vercel/kv'

export const dynamic = 'force-dynamic'

export const GET = async () => {
  const user = await kv.hgetall('user:me')

  return Response.json(user)
}
