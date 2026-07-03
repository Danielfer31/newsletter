import { PostForm } from '@/components/admin/PostForm'

export default function NewPostPage() {
  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-xl mb-4">Nuevo post</h1>
      <PostForm />
    </div>
  )
}
