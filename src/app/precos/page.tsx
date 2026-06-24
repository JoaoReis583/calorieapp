import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { IconCheck, IconApple, IconSparkles, IconArrowLeft } from '@tabler/icons-react'

export const dynamic = 'force-dynamic'

export default async function PrecosPage() {
  const session = await getServerSession(authOptions)
  const userEmail = session?.user?.email || ''

  // URLs de checkout da Cakto (com fallbacks de demonstração)
  // Podemos passar o e-mail do usuário se logado para facilitar o preenchimento no checkout
  const checkoutMensalBase = process.env.NEXT_PUBLIC_CAKTO_MENSAL_URL || 'https://cakto.com.br/checkout/demo-mensal'
  const checkoutAnualBase = process.env.NEXT_PUBLIC_CAKTO_ANUAL_URL || 'https://cakto.com.br/checkout/demo-anual'

  const checkoutMensal = userEmail ? `${checkoutMensalBase}?email=${encodeURIComponent(userEmail)}` : checkoutMensalBase
  const checkoutAnual = userEmail ? `${checkoutAnualBase}?email=${encodeURIComponent(userEmail)}` : checkoutAnualBase

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        {/* Botão para voltar */}
        <div className="w-full max-w-4xl mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <IconArrowLeft className="h-4 w-4" />
            Voltar ao Painel
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
            <IconSparkles className="h-3.5 w-3.5" />
            Acesso Premium Ilimitado
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Escolha o plano ideal para a sua saúde
          </h1>
          <p className="text-lg text-slate-500">
            Desbloqueie o poder total da Inteligência Artificial Nutricional e atinja seus objetivos sem limites.
          </p>
        </div>

        {/* Grid de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          
          {/* Plano Mensal */}
          <div className="relative rounded-[2.5rem] bg-white p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Acesso Mensal</span>
              <h2 className="text-2xl font-bold text-slate-900">Plano Mensal</h2>
              <p className="text-slate-500 text-sm mt-2">Flexibilidade para monitorar sua rotina mês a mês.</p>
              
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">R$ 12,99</span>
                <span className="text-slate-400 text-sm font-medium">/ mês</span>
              </div>

              {/* Lista de Recursos */}
              <ul className="mt-8 space-y-4 text-sm text-slate-600">
                <li className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span>Escaneamento de pratos por IA ilimitado</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span>Identificação precisa de porções e macros</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span>Histórico mensal e anéis de atividade</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span>Estatísticas e recordes avançados</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a
                href={checkoutMensal}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center rounded-2xl border-2 border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-98"
              >
                Assinar Plano Mensal
              </a>
            </div>
          </div>

          {/* Plano Anual - Destaque */}
          <div className="relative rounded-[2.5rem] bg-gradient-to-b from-slate-900 to-slate-950 p-8 text-white shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between border border-slate-800 overflow-hidden">
            {/* Tag de Melhor Opção */}
            <div className="absolute top-4 right-4 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
              Melhor Preço (-65%)
            </div>

            <div>
              <span className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Acesso Anual</span>
              <h2 className="text-2xl font-bold">Plano Anual</h2>
              <p className="text-slate-400 text-sm mt-2">O melhor custo-benefício para transformar sua alimentação a longo prazo.</p>
              
              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">R$ 54,99</span>
                  <span className="text-slate-400 text-sm font-medium">/ ano</span>
                </div>
                <span className="block text-[11px] font-semibold text-blue-400 mt-1">Equivale a apenas R$ 4,58 por mês!</span>
              </div>

              {/* Lista de Recursos */}
              <ul className="mt-8 space-y-4 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-blue-400">
                    <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span>Escaneamento de pratos por IA ilimitado</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-blue-400">
                    <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span>Identificação precisa de porções e macros</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-blue-400">
                    <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span>Histórico mensal e anéis de atividade</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-blue-400">
                    <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span>Estatísticas e recordes avançados</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-blue-400">
                    <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span className="font-semibold text-white">Suporte prioritário e novidades em primeira mão</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a
                href={checkoutAnual}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-900/30 hover:bg-blue-500 hover:shadow-lg transition-all active:scale-98"
              >
                Assinar Plano Anual
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
