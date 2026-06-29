import { prisma } from './prisma'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Caminho do arquivo JSON local para fallback de desenvolvimento
const DB_JSON_PATH = path.join(process.cwd(), 'db.json')

// Cache de disponibilidade do banco – evita o TCP timeout a cada requisição
// após a primeira falha. Reseta depois de 60s para tentar novamente.
let pgAvailable: boolean | null = null
let pgLastCheckTime = 0
const PG_RETRY_INTERVAL_MS = 60_000 // 1 minuto

async function isPgAvailable(): Promise<boolean> {
  const now = Date.now()
  // Se já sabemos a resposta e não passou o intervalo de retry, usar o cache
  if (pgAvailable !== null && now - pgLastCheckTime < PG_RETRY_INTERVAL_MS) {
    return pgAvailable
  }

  try {
    // Verificação rápida: consulta leve com timeout via Promise.race
    await Promise.race([
      prisma.$queryRawUnsafe('SELECT 1'),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout de conexão')), 2000)
      ),
    ])
    pgAvailable = true
  } catch {
    pgAvailable = false
  }

  pgLastCheckTime = now
  return pgAvailable
}

// Inicializar banco JSON se não existir
function initJsonDb() {
  if (!fs.existsSync(DB_JSON_PATH)) {
    fs.writeFileSync(
      DB_JSON_PATH,
      JSON.stringify({ users: [], meals: [], meal_items: [] }, null, 2)
    )
  }
}

// Ler do banco JSON
function readJsonDb(): { users: any[]; meals: any[]; meal_items: any[] } {
  try {
    initJsonDb()
    const data = fs.readFileSync(DB_JSON_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    console.error('Erro ao ler db.json local:', err)
    return { users: [], meals: [], meal_items: [] }
  }
}

// Salvar no banco JSON
function writeJsonDb(data: { users: any[]; meals: any[]; meal_items: any[] }) {
  try {
    fs.writeFileSync(DB_JSON_PATH, JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Erro ao gravar no db.json local:', err)
  }
}

export const dbService = {
  // ---- USUÁRIOS ----
  async findUserByEmail(email: string) {
    const cleanEmail = email.trim().toLowerCase()
    if (await isPgAvailable()) {
      try {
        return await prisma.user.findUnique({ where: { email: cleanEmail } })
      } catch {
        pgAvailable = false
      }
    }
    console.warn('Banco Postgres indisponível. Fazendo busca de usuário em db.json local.')
    const db = readJsonDb()
    return db.users.find((u) => u.email.trim().toLowerCase() === cleanEmail) || null
  },

  async findUserById(id: string) {
    if (await isPgAvailable()) {
      try {
        return await prisma.user.findUnique({ where: { id } })
      } catch {
        pgAvailable = false
      }
    }
    console.warn('Banco Postgres indisponível. Fazendo busca de usuário por ID em db.json local.')
    const db = readJsonDb()
    return db.users.find((u) => u.id === id) || null
  },

  async createUser(nome: string, email: string, senhaHash: string) {
    const defaultCalorias = 2000
    const defaultProteinas = 150
    const defaultCarboidratos = 250
    const defaultGorduras = 70
    
    const cleanEmail = email.trim().toLowerCase()

    if (await isPgAvailable()) {
      try {
        return await prisma.user.create({
          data: {
            nome,
            email: cleanEmail,
            senha: senhaHash,
            meta_calorias: defaultCalorias,
            meta_proteinas: defaultProteinas,
            meta_carboidratos: defaultCarboidratos,
            meta_gorduras: defaultGorduras,
            plano: 'FREE',
          },
        })
      } catch {
        pgAvailable = false
      }
    }

    console.warn('Banco Postgres indisponível. Criando usuário em db.json local.')
    const db = readJsonDb()

    if (db.users.some((u) => u.email.trim().toLowerCase() === cleanEmail)) {
      throw new Error('Usuário com este e-mail já cadastrado.')
    }

    const newUser = {
      id: uuidv4(),
      nome,
      email: cleanEmail,
      senha: senhaHash,
      meta_calorias: defaultCalorias,
      meta_proteinas: defaultProteinas,
      meta_carboidratos: defaultCarboidratos,
      meta_gorduras: defaultGorduras,
      plano: 'FREE',
      assinatura_valida_ate: null,
      cakto_transaction_id: null,
      criado_em: new Date().toISOString(),
    }
    db.users.push(newUser)
    writeJsonDb(db)
    return newUser
  },

  async updateUserGoals(userId: string, goals: { calorias: number; proteinas: number; carboidratos: number; gorduras: number }) {
    if (await isPgAvailable()) {
      try {
        return await prisma.user.update({
          where: { id: userId },
          data: {
            meta_calorias: goals.calorias,
            meta_proteinas: goals.proteinas,
            meta_carboidratos: goals.carboidratos,
            meta_gorduras: goals.gorduras,
          },
        })
      } catch {
        pgAvailable = false
      }
    }

    console.warn('Banco Postgres indisponível. Atualizando metas do usuário em db.json local.')
    const db = readJsonDb()
    const userIdx = db.users.findIndex((u) => u.id === userId)
    if (userIdx !== -1) {
      db.users[userIdx] = {
        ...db.users[userIdx],
        meta_calorias: goals.calorias,
        meta_proteinas: goals.proteinas,
        meta_carboidratos: goals.carboidratos,
        meta_gorduras: goals.gorduras,
      }
      writeJsonDb(db)
      return db.users[userIdx]
    }
    throw new Error('Usuário não encontrado.')
  },

  async updateUserPlan(userId: string, plano: string, validadeAte: Date | null, transacaoId: string | null) {
    if (await isPgAvailable()) {
      try {
        return await prisma.user.update({
          where: { id: userId },
          data: {
            plano,
            assinatura_valida_ate: validadeAte,
            cakto_transaction_id: transacaoId,
          },
        })
      } catch {
        pgAvailable = false
      }
    }

    console.warn('Banco Postgres indisponível. Atualizando plano do usuário em db.json local.')
    const db = readJsonDb()
    const userIdx = db.users.findIndex((u) => u.id === userId)
    if (userIdx !== -1) {
      db.users[userIdx] = {
        ...db.users[userIdx],
        plano,
        assinatura_valida_ate: validadeAte ? validadeAte.toISOString() : null,
        cakto_transaction_id: transacaoId,
      }
      writeJsonDb(db)
      return db.users[userIdx]
    }
    throw new Error('Usuário não encontrado.')
  },

  // ---- REFEIÇÕES ----
  async createMeal(userId: string, data: {
    foto: string
    calorias: number
    proteinas: number
    carboidratos: number
    gorduras: number
    fibras: number
    dataRefeicao?: string
    items: {
      nome: string
      quantidade_gramas: number
      calorias: number
      proteinas: number
      carboidratos: number
      gorduras: number
    }[]
  }) {
    const dateToSave = data.dataRefeicao ? new Date(data.dataRefeicao) : new Date()

    if (await isPgAvailable()) {
      try {
        return await prisma.meal.create({
          data: {
            user_id: userId,
            foto: data.foto,
            calorias: data.calorias,
            proteinas: data.proteinas,
            carboidratos: data.carboidratos,
            gorduras: data.gorduras,
            fibras: data.fibras,
            data: dateToSave,
            items: { create: data.items },
          },
          include: { items: true },
        })
      } catch {
        pgAvailable = false
      }
    }

    console.warn('Banco Postgres indisponível. Criando refeição em db.json local.')
    const db = readJsonDb()

    const mealId = uuidv4()
    const newMealItems = data.items.map((item) => ({
      id: uuidv4(),
      meal_id: mealId,
      nome: item.nome,
      quantidade_gramas: item.quantidade_gramas,
      calorias: item.calorias,
      proteinas: item.proteinas,
      carboidratos: item.carboidratos,
      gorduras: item.gorduras,
    }))

    const newMeal = {
      id: mealId,
      user_id: userId,
      foto: data.foto,
      calorias: data.calorias,
      proteinas: data.proteinas,
      carboidratos: data.carboidratos,
      gorduras: data.gorduras,
      fibras: data.fibras,
      data: dateToSave.toISOString(),
      items: newMealItems,
    }

    db.meals.push({
      id: newMeal.id,
      user_id: newMeal.user_id,
      foto: newMeal.foto,
      calorias: newMeal.calorias,
      proteinas: newMeal.proteinas,
      carboidratos: newMeal.carboidratos,
      gorduras: newMeal.gorduras,
      fibras: newMeal.fibras,
      data: newMeal.data,
    })
    db.meal_items.push(...newMealItems)
    writeJsonDb(db)

    return newMeal
  },

  async getMealsByUser(userId: string, filterDays?: number) {
    if (await isPgAvailable()) {
      try {
        let whereClause: any = { user_id: userId }
        if (filterDays !== undefined && filterDays > 0) {
          const thresholdDate = new Date()
          thresholdDate.setDate(thresholdDate.getDate() - filterDays)
          whereClause.data = { gte: thresholdDate }
        }
        return await prisma.meal.findMany({
          where: whereClause,
          orderBy: { data: 'desc' },
          include: { items: true },
        })
      } catch {
        pgAvailable = false
      }
    }

    console.warn('Banco Postgres indisponível. Buscando refeições do usuário em db.json local.')
    const db = readJsonDb()

    let filteredMeals = db.meals.filter((m) => m.user_id === userId)

    if (filterDays !== undefined && filterDays > 0) {
      const thresholdTime = new Date()
      thresholdTime.setDate(thresholdTime.getDate() - filterDays)
      filteredMeals = filteredMeals.filter((m) => new Date(m.data) >= thresholdTime)
    }

    const mealsWithItems = filteredMeals.map((meal) => ({
      ...meal,
      items: db.meal_items.filter((item) => item.meal_id === meal.id),
    }))

    return mealsWithItems.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
  },

  async getMealsByDateRange(userId: string, startDate: Date, endDate: Date) {
    if (await isPgAvailable()) {
      try {
        return await prisma.meal.findMany({
          where: {
            user_id: userId,
            data: { gte: startDate, lte: endDate },
          },
          orderBy: { data: 'asc' },
          include: { items: true },
        })
      } catch {
        pgAvailable = false
      }
    }

    console.warn('Banco Postgres indisponível. Buscando refeições por período em db.json local.')
    const db = readJsonDb()

    const filteredMeals = db.meals.filter(
      (m) =>
        m.user_id === userId &&
        new Date(m.data) >= startDate &&
        new Date(m.data) <= endDate
    )

    const mealsWithItems = filteredMeals.map((meal) => ({
      ...meal,
      items: db.meal_items.filter((item) => item.meal_id === meal.id),
    }))

    return mealsWithItems.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
  },
}
