import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Post, PostFrontmatter, Category } from '@/types/post'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return []

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'))

  const posts = files.map(filename => {
    const slug = filename.replace(/\.md$/, '')
    const filePath = path.join(POSTS_DIR, filename)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)
    return {
      slug,
      contenido: content,
      ...(data as PostFrontmatter),
    } as Post
  })

  return posts.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(POSTS_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    slug,
    contenido: content,
    ...(data as PostFrontmatter),
  } as Post
}

export function getAdjacentPosts(slug: string): { previous: Post | null; next: Post | null } {
  const posts = getAllPosts() // sorted descending: newest first
  const index = posts.findIndex(post => post.slug === slug)
  if (index === -1) return { previous: null, next: null }

  // Since posts are sorted descending (newest first):
  // - Previous post (older) is at index + 1
  // - Next post (newer) is at index - 1
  return {
    previous: posts[index + 1] ?? null,
    next: posts[index - 1] ?? null,
  }
}

export function getRoutePosts(slugs?: string[]): Post[] {
  if (!slugs || slugs.length === 0) return []
  const posts = getAllPosts()
  return slugs
    .map(slug => posts.find(post => post.slug === slug))
    .filter((post): post is Post => !!post)
}

export function getPostsByCategory(category: Category): Post[] {
  return getAllPosts().filter(post => post.categoria === category)
}

