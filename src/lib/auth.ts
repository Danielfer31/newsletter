import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      authorization: { params: { scope: 'read:user repo' } },
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      return profile?.login === process.env.ADMIN_GITHUB_USERNAME
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.username = (profile as { login?: string }).login
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
        user: { ...session.user, username: token.username as string },
      }
    },
  },
  pages: {
    signIn: '/admin/login',
  },
})
