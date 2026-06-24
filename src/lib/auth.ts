import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { dbService } from '@/lib/db-service'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('E-mail e senha são obrigatórios.')
        }

        const user = await dbService.findUserByEmail(credentials.email)
        if (!user) {
          throw new Error('Usuário não encontrado.')
        }

        const isPasswordValid = bcrypt.compareSync(credentials.password, user.senha)
        if (!isPasswordValid) {
          throw new Error('Senha incorreta.')
        }

        return {
          id: user.id,
          name: user.nome,
          email: user.email,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string

        // Buscar dados do plano do usuário em tempo real do DB para evitar atrasos no cache do JWT
        const user = await dbService.findUserById(token.id as string)
        if (user) {
          session.user.plano = user.plano || 'FREE'
          session.user.assinatura_valida_ate = user.assinatura_valida_ate
            ? new Date(user.assinatura_valida_ate).toISOString()
            : null
        } else {
          session.user.plano = 'FREE'
          session.user.assinatura_valida_ate = null
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
