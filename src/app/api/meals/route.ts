import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { dbService } from '@/lib/db-service'

// GET /api/meals - Listar refeições do usuário autenticado
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const daysParam = searchParams.get('days')
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    const userId = session.user.id

    // 1. Filtragem por intervalo de datas personalizado
    if (startDateParam && endDateParam) {
      const startDate = new Date(startDateParam)
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(endDateParam)
      endDate.setHours(23, 59, 59, 999)

      const meals = await dbService.getMealsByDateRange(userId, startDate, endDate)
      return NextResponse.json(meals)
    }

    // 2. Filtragem por quantidade de dias retroativos (1 = hoje, 7 = 7 dias, etc.)
    if (daysParam) {
      const days = parseInt(daysParam, 10)
      if (isNaN(days) || days <= 0) {
        return NextResponse.json({ error: 'Parâmetro de dias inválido.' }, { status: 400 })
      }

      // Se for "1" dia (hoje), filtramos a partir de hoje 00:00:00
      if (days === 1) {
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)

        const endOfToday = new Date()
        endOfToday.setHours(23, 59, 59, 999)

        const meals = await dbService.getMealsByDateRange(userId, startOfToday, endOfToday)
        return NextResponse.json(meals)
      }

      const meals = await dbService.getMealsByUser(userId, days)
      return NextResponse.json(meals)
    }

    // 3. Sem filtros: retorna todas as refeições do usuário
    const meals = await dbService.getMealsByUser(userId)
    return NextResponse.json(meals)
  } catch (error: any) {
    console.error('Erro ao buscar refeições:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar busca de refeições.' },
      { status: 500 }
    )
  }
}

// POST /api/meals - Criar nova refeição com itens
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const body = await req.json()
    const { foto, calorias, proteinas, carboidratos, gorduras, fibras, items, dataRefeicao } = body

    if (!foto || calorias === undefined || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Dados incompletos para registrar refeição.' },
        { status: 400 }
      )
    }

    const userId = session.user.id

    // Verificar se o usuário gratuito já atingiu o limite de 3 refeições
    const user = await dbService.findUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    const isPremium = user.plano === 'MENSAL' || user.plano === 'ANUAL'
    if (!isPremium) {
      const allMeals = await dbService.getMealsByUser(userId)
      if (allMeals.length >= 3) {
        return NextResponse.json(
          { error: 'Limite do plano gratuito atingido. Assine o plano Premium para continuar.' },
          { status: 403 }
        )
      }
    }

    const newMeal = await dbService.createMeal(userId, {
      foto,
      calorias: Math.round(calorias),
      proteinas: Number(proteinas || 0),
      carboidratos: Number(carboidratos || 0),
      gorduras: Number(gorduras || 0),
      fibras: Number(fibras || 0),
      dataRefeicao,
      items: items.map((item: any) => ({
        nome: item.nome,
        quantidade_gramas: Number(item.quantidade_gramas || 0),
        calorias: Math.round(item.calorias || 0),
        proteinas: Number(item.proteinas || 0),
        carboidratos: Number(item.carboidratos || 0),
        gorduras: Number(item.gorduras || 0),
      })),
    })

    return NextResponse.json(newMeal, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao salvar refeição:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno ao salvar refeição.' },
      { status: 500 }
    )
  }
}
