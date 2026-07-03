import { signIn } from '@/lib/auth'

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto mt-24 text-center">
      <h1 className="text-xl mb-4">Panel de administración</h1>
      <form
        action={async () => {
          'use server'
          await signIn('github', { redirectTo: '/admin' })
        }}
      >
        <button type="submit" className="border px-4 py-2">
          Login con GitHub
        </button>
      </form>
    </div>
  )
}
