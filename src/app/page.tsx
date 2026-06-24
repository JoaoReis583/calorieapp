import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  IconApple,
  IconScan,
  IconFlame,
  IconMeat,
  IconChevronRight,
  IconChartBar,
  IconCalendar
} from '@tabler/icons-react'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      {/* Header/Nav */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xl font-bold text-blue-600">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
              <IconApple className="h-6 w-6 stroke-[1.5]" />
            </div>
            <span className="tracking-tight">CalorieTrack<span className="text-slate-900 font-semibold font-mono text-sm ml-1 bg-slate-100 px-1.5 py-0.5 rounded-md">AI</span></span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-all hover:shadow-md active:scale-95"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <span className="inline-flex max-w-fit items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 ring-1 ring-inset ring-blue-500/10">
                Lançamento Oficial v1.0
              </span>
              <h1 className="text-4xl font-extrabold tracking-tighter text-slate-950 sm:text-5xl lg:text-6xl leading-[1.05]">
                Monitore sua alimentação <br className="hidden sm:inline" />
                apenas <span className="text-blue-600">tirando uma foto</span>.
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-[50ch]">
                Nossa IA inteligente analisa seus pratos instantaneamente para estimar alimentos, gramas, calorias e macronutrientes.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-100 active:scale-98"
                >
                  Começar Agora
                  <IconChevronRight className="h-4 w-4 stroke-[2]" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-98"
                >
                  Fazer Login
                </Link>
              </div>
            </div>

            {/* Hero Asset Mock-up */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[380px] overflow-hidden rounded-[2.5rem] border-[8px] border-slate-900 bg-slate-900 shadow-2xl">
                {/* Status Bar */}
                <div className="flex h-6 justify-between px-6 pt-1 text-[10px] font-semibold text-slate-400">
                  <span>19:54</span>
                  <div className="flex gap-1.5">
                    <span>5G</span>
                    <div className="w-4 h-2.5 rounded-sm border border-slate-400 p-0.5"><div className="w-full h-full bg-slate-400 rounded-2xs"></div></div>
                  </div>
                </div>
                {/* Content */}
                <div className="bg-slate-50 p-4 min-h-[460px]">
                  {/* Photo Preview inside phone */}
                  <div className="relative h-44 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
                      alt="Prato saudável de salada com salmão"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-lg bg-blue-600/90 px-2 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-xs">
                      <IconScan className="h-3.5 w-3.5 animate-pulse" />
                      Análise IA Ativa
                    </div>
                  </div>
                  {/* AI Results Simulation */}
                  <div className="mt-3 space-y-2">
                    <div className="rounded-xl bg-white p-3 border border-slate-100 shadow-xs">
                      <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Resultado da Detecção</span>
                      <div className="mt-1.5 space-y-1 text-xs">
                        <div className="flex justify-between border-b border-slate-50 pb-1 font-medium text-slate-800">
                          <span>Salmão Grelhado</span>
                          <span className="text-slate-500">150g (309 kcal)</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-1 font-medium text-slate-800">
                          <span>Purê de Batata Doce</span>
                          <span className="text-slate-500">120g (112 kcal)</span>
                        </div>
                        <div className="flex justify-between font-medium text-slate-800">
                          <span>Brócolis Vapor</span>
                          <span className="text-slate-500">100g (35 kcal)</span>
                        </div>
                      </div>
                    </div>
                    {/* Calories counter mockup */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-blue-50/50 p-2 border border-blue-100/50 text-center">
                        <span className="block text-[8px] font-medium text-blue-500 uppercase">Carboidratos</span>
                        <span className="text-xs font-bold text-blue-600">32.8g</span>
                      </div>
                      <div className="rounded-xl bg-emerald-50/50 p-2 border border-emerald-100/50 text-center">
                        <span className="block text-[8px] font-medium text-emerald-500 uppercase">Proteínas</span>
                        <span className="text-xs font-bold text-emerald-600">37.7g</span>
                      </div>
                      <div className="rounded-xl bg-rose-50/50 p-2 border border-rose-100/50 text-center">
                        <span className="block text-[8px] font-medium text-rose-500 uppercase">Calorias</span>
                        <span className="text-xs font-bold text-rose-600">456 kcal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Feature Grid */}
        <section className="bg-slate-50 py-20 border-y border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Funcionalidades Premium do CalorieTrack AI
              </h2>
              <p className="mt-4 text-slate-600 text-sm">
                Uma solução nutricional completa desenvolvida para automatizar sua rotina e otimizar seus resultados de saúde.
              </p>
            </div>

            {/* Bento Grid layout with diverse tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="md:col-span-2 rounded-2xl bg-white p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-6">
                    <IconScan className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">Visão Computacional Avançada</h3>
                  <p className="text-slate-600 text-sm max-w-[50ch]">
                    Reconhecimento fotográfico inteligente de alimentos e estimativa automatizada de porções em gramas. Sem necessidade de digitar ingrediente por ingrediente.
                  </p>
                </div>
                <div className="mt-8 rounded-xl bg-slate-50 border border-slate-100 p-4 text-xs font-mono text-slate-500">
                  // Resultado do Scan de Prato por IA<br/>
                  &gt; Alimento: Peito de Frango (150g) | Prot: 46.5g | Carbo: 0g | Gord: 5.4g
                </div>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white mb-6">
                    <IconFlame className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Monitoramento de Calorias</h3>
                  <p className="text-blue-100 text-sm">
                    Acompanhe instantaneamente seu consumo calórico e de macronutrientes em relação a suas metas diárias personalizadas.
                  </p>
                </div>
                <div className="mt-8 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono">1.840</span>
                  <span className="text-blue-200 text-xs">/ 2.200 kcal consumidas hoje</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl bg-white p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-6">
                    <IconCalendar className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">Anéis de Atividade Mensal</h3>
                  <p className="text-slate-600 text-sm">
                    Monitore sua constância através de um histórico em formato de calendário baseado em anéis de atividade concêntricos (Calorias, Proteínas e Carboidratos).
                  </p>
                </div>
                <div className="mt-6 flex justify-center py-2">
                  <div className="flex gap-2">
                    <div className="h-6 w-6 rounded-full border-2 border-rose-500/20 bg-rose-500/10 flex items-center justify-center text-[10px] text-rose-600 font-bold">C</div>
                    <div className="h-6 w-6 rounded-full border-2 border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center text-[10px] text-emerald-600 font-bold">P</div>
                    <div className="h-6 w-6 rounded-full border-2 border-blue-500/20 bg-blue-500/10 flex items-center justify-center text-[10px] text-blue-600 font-bold">M</div>
                  </div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="md:col-span-2 rounded-2xl bg-white p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-6">
                    <IconChartBar className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">Estatísticas e Recordes</h3>
                  <p className="text-slate-600 text-sm max-w-[50ch]">
                    Gráficos mensais interativos detalhando sua evolução. Descubra sua média diária de ingestão calórica, dias recordes e o balanço correto de macronutrientes.
                  </p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
                    <span className="block text-[10px] font-medium text-slate-500">MÉDIA DIÁRIA</span>
                    <span className="text-lg font-bold text-slate-800">1.954 kcal</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
                    <span className="block text-[10px] font-medium text-slate-500">MELHOR DIA</span>
                    <span className="text-lg font-bold text-blue-600">Domingo (98%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p>© 2026 CalorieTrack AI. Todos os direitos reservados. Design refinado.</p>
        </div>
      </footer>
    </div>
  )
}
