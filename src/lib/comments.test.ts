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

describe('deleteComment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes a top-level comment and cascades to its replies', async () => {
    const topLevel = {
      id: 'c1',
      slug: 'post-1',
      parentId: null,
      name: 'A',
      email: 'a@b.com',
      body: 'top',
      createdAt: 1000,
    }
    mockRedis.get.mockResolvedValueOnce(topLevel) // fetch the comment being deleted
    mockRedis.zrange.mockResolvedValueOnce(['r1', 'r2']) // reply ids

    const { deleteComment } = await import('./comments')
    await deleteComment('c1')

    expect(mockRedis.del).toHaveBeenCalledWith('comment:r1')
    expect(mockRedis.del).toHaveBeenCalledWith('comment:r2')
    expect(mockRedis.del).toHaveBeenCalledWith('replies:c1')
    expect(mockRedis.del).toHaveBeenCalledWith('comment:c1')
    expect(mockRedis.zrem).toHaveBeenCalledWith('comments:post-1', 'c1')
  })

  it('deletes a reply without touching siblings', async () => {
    const reply = {
      id: 'r1',
      slug: 'post-1',
      parentId: 'c1',
      name: 'B',
      email: 'b@c.com',
      body: 'reply',
      createdAt: 1500,
    }
    mockRedis.get.mockResolvedValueOnce(reply)

    const { deleteComment } = await import('./comments')
    await deleteComment('r1')

    expect(mockRedis.del).toHaveBeenCalledWith('comment:r1')
    expect(mockRedis.zrem).toHaveBeenCalledWith('replies:c1', 'r1')
    expect(mockRedis.zrem).not.toHaveBeenCalledWith('comments:post-1', 'r1')
  })

  it('no-ops when the comment does not exist', async () => {
    mockRedis.get.mockResolvedValueOnce(null)

    const { deleteComment } = await import('./comments')
    await deleteComment('missing')

    expect(mockRedis.del).not.toHaveBeenCalled()
  })
})
