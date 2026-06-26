import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Post, PostFrontmatter } from '@/types/post'

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
