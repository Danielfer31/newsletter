import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  zadd: vi.fn(),
  zrange: vi.fn(),
  zrem: vi.fn(),
}

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(function Redis() {
    return mockRedis
  }),
}))

process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io'
process.env.UPSTASH_REDIS_REST_TOKEN = 'fake-token'

const { updateComment } = await import('./comments')

describe('updateComment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('patches name and body, keeps other fields, and persists', async () => {
    const existing = {
      id: 'c1',
      slug: 'post-1',
      parentId: null,
      name: 'Old Name',
      email: 'a@b.com',
      body: 'old body',
      createdAt: 1000,
    }
    mockRedis.get.mockResolvedValueOnce(existing)

    const result = await updateComment('c1', { name: 'New Name' })

    expect(result).toEqual({ ...existing, name: 'New Name' })
    expect(mockRedis.set).toHaveBeenCalledWith('comment:c1', { ...existing, name: 'New Name' })
  })

  it('returns null when the comment does not exist', async () => {
    mockRedis.get.mockResolvedValueOnce(null)

    const result = await updateComment('missing', { body: 'x' })

    expect(result).toBeNull()
    expect(mockRedis.set).not.toHaveBeenCalled()
  })
})
