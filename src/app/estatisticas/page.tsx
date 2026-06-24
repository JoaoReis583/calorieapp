import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { dbService } from '@/lib/db-service'
import { Navbar } from '@/components/navbar'
import { EstatisticaClient } from '@/components/estatistica-client'

export const dynamic = 'force-dynamic'

export default async function EstatisticasPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = session.user.id

  // 1. Obter dados das metas do usuário
  const user = await dbService.findUserById(userId)
  if (!user) {
    redirect('/login')
  }

  // 2. Buscar todas as refeições
  const meals = await dbService.getMealsByUser(userId)

  const userGoals = {
    meta_calorias: user.meta_calorias,
    meta_proteinas: user.meta_proteinas,
    meta_carboidratos: user.meta_carboidratos,
    meta_gorduras: user.meta_gorduras,
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <EstatisticaClient meals={meals} goals={userGoals} />
      </main>
    </div>
  )
}
