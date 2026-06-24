import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { dbService } from '@/lib/db-service'
import { Navbar } from '@/components/navbar'
import { DashboardClient } from '@/components/dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = session.user.id

  // 1. Obter dados atualizados do usuário (incluindo as metas)
  const user = await dbService.findUserById(userId)
  if (!user) {
    redirect('/login')
  }

  // 2. Obter as refeições de hoje
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  const todayMeals = await dbService.getMealsByDateRange(userId, startOfToday, endOfToday)
  const allMeals = await dbService.getMealsByUser(userId)
  const totalMealsCount = allMeals.length

  // Metas do usuário para passar para o cliente
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
        <DashboardClient
          initialMeals={todayMeals}
          goals={userGoals}
          userPlan={user.plano || 'FREE'}
          totalMealsCount={totalMealsCount}
        />
      </main>
    </div>
  )
}
