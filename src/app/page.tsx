import { getAllPosts } from '@/lib/posts'

export default function Home() {
  const posts = getAllPosts()
  return (
    <div style={{ color: 'white', padding: '2rem' }}>
      <h1>Posts loaded: {posts.length}</h1>
      {posts.map(p => <p key={p.slug}>{p.titulo} — {p.categoria}</p>)}
    </div>
  )
}
