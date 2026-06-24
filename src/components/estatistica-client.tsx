'use client'

import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts'
import {
  IconFlame,
  IconMeat,
  IconBread,
  IconDroplet,
  IconAward,
  IconAlertCircle,
  IconTrendingUp,
  IconActivity
} from '@tabler/icons-react'

interface MealItem {
  nome: string
  quantidade_gramas: number
  calorias: number
  proteinas: number
  carboidratos: number
  gorduras: number
}

interface Meal {
  id: string
  foto: string
  calorias: number
  proteinas: number
  carboidratos: number
  gorduras: number
  fibras: number
  data: string | Date
  items: MealItem[]
}

interface EstatisticaClientProps {
  meals: Meal[]
  goals: {
    meta_calorias: number
    meta_proteinas: number
    meta_carboidratos: number
    meta_gorduras: number
  }
}

const monthShortNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function EstatisticaClient({ meals, goals }: EstatisticaClientProps) {
  const [mounted, setMounted] = useState(false)

  // Evitar hydration errors com Recharts no Next.js
  useEffect(() => {
    setMounted(true)
  }, [])

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  // 1. Processar dados para: Calorias por dia no mês ativo
  const getDaysInMonthData = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const data = []

    for (let day = 1; day <= daysInMonth; day++) {
      // Filtrar refeições deste dia específico
      const dayMeals = meals.filter((meal) => {
        const d = new Date(meal.data)
        return (
          d.getDate() === day &&
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear
        )
      })

      const totalKcal = dayMeals.reduce((acc, m) => acc + m.calorias, 0)
      data.push({
        name: `${day.toString().padStart(2, '0')}`,
        Calorias: totalKcal,
        Meta: goals.meta_calorias,
      })
    }
    return data
  }

  const daysData = getDaysInMonthData()

  // 2. Processar dados para: Calorias e Macros acumulados por mês (últimos 6 meses)
  const getMonthlyTrendData = () => {
    const data = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1)
      const targetMonth = d.getMonth()
      const targetYear = d.getFullYear()

      const monthMeals = meals.filter((meal) => {
        const mealDate = new Date(meal.data)
        return mealDate.getMonth() === targetMonth && mealDate.getFullYear() === targetYear
      })

      const totalKcal = monthMeals.reduce((acc, m) => acc + m.calorias, 0)
      const totalProt = monthMeals.reduce((acc, m) => acc + m.proteinas, 0)
      const totalCarb = monthMeals.reduce((acc, m) => acc + m.carboidratos, 0)
      const totalFat = monthMeals.reduce((acc, m) => acc + m.gorduras, 0)

      data.push({
        name: monthShortNames[targetMonth],
        Calorias: totalKcal,
        Proteínas: Math.round(totalProt),
        Carboidratos: Math.round(totalCarb),
        Gorduras: Math.round(totalFat),
      })
    }
    return data
  }

  const monthlyTrendData = getMonthlyTrendData()

  // 3. Cálculos estatísticos do mês ativo
  const currentMonthMeals = meals.filter((meal) => {
    const d = new Date(meal.data)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  // Agrupar refeições por dia do mês ativo para encontrar médias reais
  const dailyKcalMap: { [day: number]: number } = {}
  currentMonthMeals.forEach((meal) => {
    const d = new Date(meal.data).getDate()
    dailyKcalMap[d] = (dailyKcalMap[d] || 0) + meal.calorias
  })

  const recordedDays = Object.keys(dailyKcalMap).map(Number)
  const totalKcalActiveMonth = currentMonthMeals.reduce((acc, m) => acc + m.calorias, 0)

  // Média diária baseada nos dias do mês transcorridos ou dias registrados
  const daysInMonthSoFar = now.getDate()
  const mediaDiaria = daysInMonthSoFar > 0 ? Math.round(totalKcalActiveMonth / daysInMonthSoFar) : 0

  // Encontrar melhor e pior dia no mês ativo (proximidade da meta de calorias)
  let melhorDia = '-'
  let melhorDiaPct = 0
  let piorDia = '-'
  let piorDiaPct = 0

  if (recordedDays.length > 0) {
    let minDev = Infinity
    let maxDev = -1
    let bestDayNum = -1
    let worstDayNum = -1

    recordedDays.forEach((day) => {
      const kcal = dailyKcalMap[day]
      const dev = Math.abs(kcal - goals.meta_calorias)

      if (dev < minDev) {
        minDev = dev
        bestDayNum = day
      }

      if (dev > maxDev) {
        maxDev = dev
        worstDayNum = day
      }
    })

    if (bestDayNum !== -1) {
      const bestKcal = dailyKcalMap[bestDayNum]
      melhorDiaPct = Math.round((bestKcal / goals.meta_calorias) * 100)
      melhorDia = `${bestDayNum.toString().padStart(2, '0')} (${melhorDiaPct}% da meta)`
    }

    if (worstDayNum !== -1) {
      const worstKcal = dailyKcalMap[worstDayNum]
      piorDiaPct = Math.round((worstKcal / goals.meta_calorias) * 100)
      piorDia = `${worstDayNum.toString().padStart(2, '0')} (${piorDiaPct}% da meta)`
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Estatísticas Mensais</h1>
        <p className="text-sm text-slate-500">Métricas analíticas sobre seu consumo de calorias e macros.</p>
      </div>

      {/* Numeric Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Média Diária */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <IconTrendingUp className="h-6 w-6 stroke-[1.5]" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Média Diária</span>
            <span className="text-xl font-extrabold text-slate-800">{mediaDiaria} kcal</span>
          </div>
        </div>

        {/* Total Mensal */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <IconActivity className="h-6 w-6 stroke-[1.5]" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Mensal</span>
            <span className="text-xl font-extrabold text-slate-800">{totalKcalActiveMonth} kcal</span>
          </div>
        </div>

        {/* Melhor Dia */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <IconAward className="h-6 w-6 stroke-[1.5]" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Melhor Dia (Aderência)</span>
            <span className="text-sm font-extrabold text-slate-800 truncate block">{melhorDia}</span>
          </div>
        </div>

        {/* Pior Dia */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <IconAlertCircle className="h-6 w-6 stroke-[1.5]" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pior Dia (Aderência)</span>
            <span className="text-sm font-extrabold text-slate-800 truncate block">{piorDia}</span>
          </div>
        </div>
      </div>

      {/* Gráfico 1: Calorias por Dia (Mês Ativo) */}
      <div className="rounded-[2.5rem] bg-white border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
            <IconFlame className="h-4 w-4 stroke-[1.5]" />
            Consumo vs Meta Diária
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-3">Calorias Consumidas por Dia</h2>
          <p className="text-xs text-slate-400">Acompanhamento diário no mês corrente de {monthShortNames[currentMonth]} {currentYear}.</p>
        </div>

        <div className="h-80 w-full pt-4">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalorias" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  labelClassName="text-slate-400 text-xs font-bold font-mono"
                  itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Calorias" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCalorias)" />
                <Area type="monotone" dataKey="Meta" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="5 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 text-xs font-bold text-slate-400">
              Carregando gráfico...
            </div>
          )}
        </div>
      </div>

      {/* Gráficos 2: Histórico Acumulado Mensal (Calorias vs Macros) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Calorias por Mês */}
        <div className="rounded-[2.5rem] bg-white border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Calorias por Mês</h3>
            <p className="text-xs text-slate-400">Total calórico consumido nos últimos 6 meses.</p>
          </div>
          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="Calorias" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 text-xs font-bold text-slate-400">
                Carregando gráfico...
              </div>
            )}
          </div>
        </div>

        {/* Macronutrientes por Mês */}
        <div className="rounded-[2.5rem] bg-white border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Macronutrientes por Mês</h3>
            <p className="text-xs text-slate-400">Consumo total acumulado de macros nos últimos 6 meses (g).</p>
          </div>
          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Bar dataKey="Proteínas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Carboidratos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gorduras" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 text-xs font-bold text-slate-400">
                Carregando gráfico...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
