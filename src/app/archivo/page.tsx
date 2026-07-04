import { getAllPosts } from '@/lib/posts'
import ArchiveClient from './ArchiveClient'

export default function ArchivoPage() {
  return <ArchiveClient posts={getAllPosts()} />
}
