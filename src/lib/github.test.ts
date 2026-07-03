import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetContent = vi.fn()
const mockCreateOrUpdate = vi.fn()
const mockDeleteFile = vi.fn()

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(() => ({
    repos: {
      getContent: mockGetContent,
      createOrUpdateFileContents: mockCreateOrUpdate,
      deleteFile: mockDeleteFile,
    },
  })),
}))

process.env.GITHUB_REPO_OWNER = 'test-owner'
process.env.GITHUB_REPO_NAME = 'test-repo'
process.env.GITHUB_REPO_BRANCH = 'main'

const { commitPost, deletePost } = await import('./github')

describe('commitPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a new file when it does not exist yet', async () => {
    mockGetContent.mockRejectedValueOnce({ status: 404 })

    await commitPost('my-slug', '---\ntitulo: x\n---\nbody', 'fake-token')

    expect(mockCreateOrUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: 'test-owner',
        repo: 'test-repo',
        path: 'content/posts/my-slug.md',
        branch: 'main',
        message: 'docs: create post my-slug',
      }),
    )
    const call = mockCreateOrUpdate.mock.calls[0][0]
    expect(call.sha).toBeUndefined()
    expect(Buffer.from(call.content, 'base64').toString('utf-8')).toBe('---\ntitulo: x\n---\nbody')
  })

  it('updates an existing file using its current sha', async () => {
    mockGetContent.mockResolvedValueOnce({ data: { type: 'file', sha: 'abc123' } })

    await commitPost('my-slug', 'new content', 'fake-token')

    expect(mockCreateOrUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ sha: 'abc123', message: 'docs: update post my-slug' }),
    )
  })
})

describe('deletePost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes the file using its current sha', async () => {
    mockGetContent.mockResolvedValueOnce({ data: { type: 'file', sha: 'abc123' } })

    await deletePost('my-slug', 'fake-token')

    expect(mockDeleteFile).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'content/posts/my-slug.md',
        sha: 'abc123',
        message: 'docs: delete post my-slug',
      }),
    )
  })

  it('throws when the file does not exist', async () => {
    mockGetContent.mockRejectedValueOnce({ status: 404 })

    await expect(deletePost('missing-slug', 'fake-token')).rejects.toThrow()
  })
})
