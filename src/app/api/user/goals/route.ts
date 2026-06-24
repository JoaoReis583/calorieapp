import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { dbService } from '@/lib/db-service'

// GET /api/user/goals - Buscar as metas do usuário
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const user = await dbService.findUserById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    // Retorna apenas as metas
    return NextResponse.json({
      meta_calorias: user.meta_calorias,
      meta_proteinas: user.meta_proteinas,
      meta_carboidratos: user.meta_carboidratos,
      meta_gorduras: user.meta_gorduras,
    })
  } catch (error: any) {
    console.error('Erro ao obter metas:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar metas do usuário.' },
      { status: 500 }
    )
  }
}

// PUT /api/user/goals - Atualizar as metas do usuário
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const body = await req.json()
    const { meta_calorias, meta_proteinas, meta_carboidratos, meta_gorduras } = body

    if (
      meta_calorias === undefined ||
      meta_proteinas === undefined ||
      meta_carboidratos === undefined ||
      meta_gorduras === undefined
    ) {
      return NextResponse.json(
        { error: 'Todas as metas são obrigatórias.' },
        { status: 400 }
      )
    }

    const updatedUser = await dbService.updateUserGoals(session.user.id, {
      calorias: Math.round(meta_calorias),
      proteinas: Number(meta_proteinas),
      carboidratos: Number(meta_carboidratos),
      gorduras: Number(meta_gorduras),
    })

    return NextResponse.json({
      message: 'Metas atualizadas com sucesso.',
      goals: {
        meta_calorias: updatedUser.meta_calorias,
        meta_proteinas: updatedUser.meta_proteinas,
        meta_carboidratos: updatedUser.meta_carboidratos,
        meta_gorduras: updatedUser.meta_gorduras,
      },
    })
  } catch (error: any) {
    console.error('Erro ao atualizar metas:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar atualização de metas.' },
      { status: 500 }
    )
  }
}
