import { Octokit } from '@octokit/rest'

const OWNER = process.env.GITHUB_REPO_OWNER!
const REPO = process.env.GITHUB_REPO_NAME!
const BRANCH = process.env.GITHUB_REPO_BRANCH || 'main'

function postPath(slug: string): string {
  return `content/posts/${slug}.md`
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function assertSafeSlug(slug: string): void {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`Slug inválido: ${slug}`)
  }
}

// Local filesystem reads (posts.ts) only see committed content after a
// production rebuild, so every write must also nudge Vercel to redeploy.
async function triggerDeploy(): Promise<void> {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
  if (!hookUrl) return

  try {
    await fetch(hookUrl, { method: 'POST' })
  } catch (err) {
    console.error('Vercel deploy hook failed:', err)
  }
}

// `Octokit` is a real ES class in production and must be invoked with `new`.
// Test doubles (e.g. `vi.fn(() => ({...}))`) are plain functions and cannot
// be targets of `new`/`Reflect.construct`. Support both without weakening
// the production path.
function createOctokit(auth: string): Octokit {
  try {
    return new Octokit({ auth })
  } catch (err) {
    if (err instanceof TypeError && /is not a constructor/.test(err.message)) {
      return (Octokit as unknown as (options: { auth: string }) => Octokit)({ auth })
    }
    throw err
  }
}

async function getFileSha(octokit: Octokit, path: string): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path, ref: BRANCH })
    if (Array.isArray(data) || data.type !== 'file') return null
    return data.sha
  } catch (err) {
    if ((err as { status?: number }).status === 404) return null
    throw err
  }
}

export async function commitPost(slug: string, markdown: string, accessToken: string): Promise<void> {
  assertSafeSlug(slug)
  const octokit = createOctokit(accessToken)
  const path = postPath(slug)
  const sha = await getFileSha(octokit, path)

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    message: sha ? `docs: update post ${slug}` : `docs: create post ${slug}`,
    content: Buffer.from(markdown, 'utf-8').toString('base64'),
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  })

  await triggerDeploy()
}

export async function deletePost(slug: string, accessToken: string): Promise<void> {
  assertSafeSlug(slug)
  const octokit = createOctokit(accessToken)
  const path = postPath(slug)
  const sha = await getFileSha(octokit, path)
  if (!sha) throw new Error(`Post ${slug} no existe en el repo`)

  await octokit.repos.deleteFile({
    owner: OWNER,
    repo: REPO,
    path,
    message: `docs: delete post ${slug}`,
    sha,
    branch: BRANCH,
  })

  await triggerDeploy()
}
