import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { dbService } from '@/lib/db-service'

export async function POST(req: Request) {
  try {
    const { nome, email, senha } = await req.json()

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já existe
    const existingUser = await dbService.findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Este e-mail já está sendo utilizado.' },
        { status: 409 }
      )
    }

    // Hash da senha
    const salt = bcrypt.genSaltSync(10)
    const senhaHash = bcrypt.hashSync(senha, salt)

    // Criar usuário
    const user = await dbService.createUser(nome, email, senhaHash)

    // Retornar usuário sem a senha
    const { senha: _, ...userWithoutPassword } = user as any

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error: any) {
    console.error('Erro no registro do usuário:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor.' },
      { status: 500 }
    )
  }
}
