import { NextAuthOptions, Session } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { setCookie } from '../../../utils/cookie'
import { refreshAccessToken } from '../../../utils/refreshToken'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    refreshToken?: string
    expires?: number
    error?: string
    user?: {
      name?: string
      email?: string
      image?: string
      googleId?: string
    }
  }

  interface Token {
    accessToken?: string
    refreshToken?: string
    expires?: number
    error?: string
    user?: {
      name?: string
      email?: string
      image?: string
      googleId?: string
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        const accessToken = account.access_token
        const refreshToken = account.refresh_token

        setCookie('accessToken', accessToken as string, { expires: 60 * 60 * 24 * 30 })
        setCookie('refreshToken', refreshToken as string, { expires: 60 * 60 * 24 * 30 })

        return {
          accessToken,
          refreshToken,
          expires: Date.now() + (account.expires_in as number) * 1000,
          user: {
            name: user.name,
            email: user.email,
            image: user.image,
            googleId: user.id
          }
        }
      }

      if (typeof token.expires === 'number' && Date.now() < token.expires) {
        return token
      }

      return await refreshAccessToken(token)
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.expires = token.expires as number
      session.error = token.error as string
      session.user = token.user as Session['user']

      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // 1 day
  }
}
