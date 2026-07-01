import { Redis } from '@upstash/redis'

let redis: Redis | null = null

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  if (!redis) {
    redis = new Redis({ url, token })
  }
  return redis
}

export async function incrementViews(slug: string): Promise<number> {
  const client = getRedisClient()
  if (!client) return 0
  return client.incr(`views:${slug}`)
}

export async function getViews(slug: string): Promise<number> {
  const client = getRedisClient()
  if (!client) return 0
  const value = await client.get<number>(`views:${slug}`)
  return value ?? 0
}
