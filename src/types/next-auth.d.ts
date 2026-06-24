import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      plano: string
      assinatura_valida_ate: string | null
    } & DefaultSession['user']
  }
}
