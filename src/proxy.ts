// src/proxy.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export default auth((req) => {
  const isLoginPage = req.nextUrl.pathname === '/admin/login'
  if (isLoginPage) return

  if (!req.auth) {
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl))
  }
})

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
