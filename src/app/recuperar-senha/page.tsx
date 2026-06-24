'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconApple, IconArrowLeft, IconLoader, IconCheck } from '@tabler/icons-react'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)

    // Simular envio de e-mail de recuperação
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setLoading(false)
    setEnviado(true)
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
          Recupere sua senha
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Enviaremos um link de redefinição para o seu e-mail
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-100 shadow-xl rounded-[2rem] sm:px-10">
          {!enviado ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
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
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all hover:shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <IconLoader className="h-4 w-4 animate-spin" />
                      Enviando link...
                    </>
                  ) : (
                    'Enviar instruções de redefinição'
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <IconArrowLeft className="h-4 w-4 stroke-[2]" />
                  Voltar para o login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <IconCheck className="h-6 w-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Instruções enviadas!</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Se o e-mail <strong>{email}</strong> estiver cadastrado em nosso sistema, você receberá um link para redefinir sua senha em instantes.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  <IconArrowLeft className="h-4 w-4 stroke-[2]" />
                  Voltar para o login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
