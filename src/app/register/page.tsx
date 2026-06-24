'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { IconApple, IconArrowRight, IconLoader } from '@tabler/icons-react'

export default function RegisterPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!nome || !email || !senha || !confirmarSenha) {
      setError('Todos os campos são obrigatórios.')
      return
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.')
      return
    }

    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro ao registrar sua conta.')
      }

      // Login automático
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password: senha,
      })

      if (result?.error) {
        setError('Conta criada com sucesso, mas o login falhou. Faça o login manualmente.')
        router.push('/login')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Falha na conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
            <IconApple className="h-7 w-7 stroke-[1.5]" />
          </div>
        </Link>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900">
          Crie sua conta grátis
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Ou{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            faça login em sua conta existente
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-100 shadow-xl rounded-[2rem] sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="nome" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nome completo
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                autoComplete="name"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-inner bg-slate-50/50 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden transition-all text-sm font-medium"
                placeholder="João da Silva"
              />
            </div>

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
              <label htmlFor="senha" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Senha
              </label>
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
              <label htmlFor="confirmarSenha" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Confirmar senha
              </label>
              <input
                id="confirmarSenha"
                name="confirmarSenha"
                type="password"
                required
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
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
                    Criando conta...
                  </>
                ) : (
                  <>
                    Registrar
                    <IconArrowRight className="h-4 w-4 stroke-[2]" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
