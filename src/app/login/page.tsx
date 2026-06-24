'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { IconApple, IconArrowRight, IconLoader } from '@tabler/icons-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Efeito para preenchimento e login automático caso venha com credenciais na URL (?email=...&senha=...)
  useEffect(() => {
    const urlEmail = searchParams.get('email')
    const urlSenha = searchParams.get('senha')

    if (urlEmail) setEmail(urlEmail)
    if (urlSenha) setSenha(urlSenha)

    if (urlEmail && urlSenha) {
      const autoLogin = async () => {
        setLoading(true)
        setError(null)
        try {
          const result = await signIn('credentials', {
            redirect: false,
            email: urlEmail,
            password: urlSenha,
          })

          if (result?.error) {
            setError(result.error || 'Credenciais inválidas.')
          } else {
            router.push('/dashboard')
            router.refresh()
          }
        } catch (err) {
          setError('Ocorreu um erro ao realizar o login automático.')
        } finally {
          setLoading(false)
        }
      }
      
      const timer = setTimeout(autoLogin, 300)
      return () => clearTimeout(timer)
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !senha) {
      setError('E-mail e senha são obrigatórios.')
      return
    }

    setLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password: senha,
      })

      if (result?.error) {
        setError(result.error || 'Credenciais inválidas. Tente novamente.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError('Ocorreu um erro ao conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white py-8 px-4 border border-slate-100 shadow-xl rounded-[2rem] sm:px-10">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-xl bg-red-50 p-4 border border-red-100">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Endereço de e-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-inner bg-slate-50/50 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden transition-all text-sm font-medium"
            placeholder="voce@exemplo.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="senha" className="block text-sm font-semibold text-slate-700">
              Senha
            </label>
            <div className="text-sm">
              <Link
                href="/recuperar-senha"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>
          </div>
          <input
            id="senha"
            name="senha"
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-inner bg-slate-50/50 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden transition-all text-sm font-medium"
            placeholder="••••••••"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all hover:shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <IconLoader className="h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <IconArrowRight className="h-4 w-4 stroke-[2]" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
            <IconApple className="h-7 w-7 stroke-[1.5]" />
          </div>
        </Link>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900">
          Entrar na sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Ou{' '}
          <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            crie uma nova conta grátis
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={
          <div className="bg-white py-8 px-4 border border-slate-100 shadow-xl rounded-[2rem] sm:px-10 flex flex-col items-center justify-center space-y-4">
            <IconLoader className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-semibold text-slate-500">Preparando tela de acesso...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
