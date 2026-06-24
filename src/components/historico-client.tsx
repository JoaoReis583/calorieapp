'use client'

import { useState } from 'react'
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconClock,
  IconFlame,
  IconMeat,
  IconBread,
  IconPlus,
  IconCalendarEvent
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

interface HistoricoClientProps {
  initialMeals: any[]
  goals: {
    meta_calorias: number
    meta_proteinas: number
    meta_carboidratos: number
    meta_gorduras: number
  }
}

export function HistoricoClient({ initialMeals, goals }: HistoricoClientProps) {
  const [meals, setMeals] = useState<Meal[]>(initialMeals)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'hoje' | '7dias' | '30dias' | 'personalizado'>('todos')
  const [selectedDayMeals, setSelectedDayMeals] = useState<Meal[] | null>(null)
  const [selectedDateLabel, setSelectedDateLabel] = useState<string | null>(null)

  // Datas para filtro personalizado
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // 1. Geração do Calendário
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  // Primeiro dia do mês (0 = Domingo, 1 = Segunda...)
  const firstDayIndex = new Date(year, month, 1).getDay()
  // Total de dias no mês
  const totalDays = new Date(year, month + 1, 0).getDate()

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDayMeals(null)
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDayMeals(null)
  }

  // 2. Filtro de Refeições
  const getFilteredMeals = () => {
    if (selectedDayMeals !== null) {
      return selectedDayMeals
    }

    const now = new Date()

    if (selectedFilter === 'hoje') {
      return meals.filter((meal) => {
        const d = new Date(meal.data)
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        )
      })
    }

    if (selectedFilter === '7dias') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(now.getDate() - 7)
      return meals.filter((meal) => new Date(meal.data) >= sevenDaysAgo)
    }

    if (selectedFilter === '30dias') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(now.getDate() - 30)
      return meals.filter((meal) => new Date(meal.data) >= thirtyDaysAgo)
    }

    if (selectedFilter === 'personalizado' && startDate && endDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      return meals.filter((meal) => {
        const d = new Date(meal.data)
        return d >= start && d <= end
      })
    }

    // Filtro 'todos'
    return meals
  }

  const filteredMeals = getFilteredMeals()

  // 3. Obter dados diários para renderizar os anéis de atividade
  const getDayStats = (dayNum: number) => {
    const targetDate = new Date(year, month, dayNum)
    const dayMeals = meals.filter((meal) => {
      const d = new Date(meal.data)
      return (
        d.getDate() === targetDate.getDate() &&
        d.getMonth() === targetDate.getMonth() &&
        d.getFullYear() === targetDate.getFullYear()
      )
    })

    const kcal = dayMeals.reduce((acc, m) => acc + m.calorias, 0)
    const prot = dayMeals.reduce((acc, m) => acc + m.proteinas, 0)
    const carb = dayMeals.reduce((acc, m) => acc + m.carboidratos, 0)

    return {
      mealsList: dayMeals,
      kcal,
      prot,
      carb,
      hasMeals: dayMeals.length > 0
    }
  }

  const handleDayClick = (dayNum: number, stats: any) => {
    const clickedDate = new Date(year, month, dayNum)
    setSelectedDayMeals(stats.mealsList)
    setSelectedDateLabel(
      clickedDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    )
  }

  const handleClearDaySelection = () => {
    setSelectedDayMeals(null)
    setSelectedDateLabel(null)
  }

  // Renderiza as células do calendário
  const renderCalendarCells = () => {
    const cells = []

    // Preencher offsets dos dias da semana anteriores ao dia 1
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="h-20 border-b border-r border-slate-100 bg-slate-50/30" />)
    }

    // Preencher dias reais
    for (let day = 1; day <= totalDays; day++) {
      const stats = getDayStats(day)
      
      // Proporções para o SVG
      const pctKcal = Math.min(100, Math.round((stats.kcal / goals.meta_calorias) * 100))
      const pctProt = Math.min(100, Math.round((stats.prot / goals.meta_proteinas) * 100))
      const pctCarb = Math.min(100, Math.round((stats.carb / goals.meta_carboidratos) * 100))

      // SVG params: total dimension = 50px
      // Anel 1 (Kcal, Rose): r=22, circ=2*pi*22 = 138.2
      const r1 = 21
      const circ1 = 2 * Math.PI * r1
      const offset1 = stats.hasMeals ? circ1 * (1 - pctKcal / 100) : circ1

      // Anel 2 (Prot, Emerald): r=16, circ=2*pi*16 = 100.5
      const r2 = 15
      const circ2 = 2 * Math.PI * r2
      const offset2 = stats.hasMeals ? circ2 * (1 - pctProt / 100) : circ2

      // Anel 3 (Carb, Sky): r=10, circ=2*pi*10 = 62.8
      const r3 = 9
      const circ3 = 2 * Math.PI * r3
      const offset3 = stats.hasMeals ? circ3 * (1 - pctCarb / 100) : circ3

      cells.push(
        <button
          key={`day-${day}`}
          onClick={() => handleDayClick(day, stats)}
          className={`h-20 border-b border-r border-slate-100 flex flex-col items-center justify-center relative hover:bg-slate-50 transition-all p-1 group cursor-pointer ${
            stats.hasMeals ? 'bg-white' : 'bg-white/50'
          }`}
        >
          {/* Círculo do dia com anéis de atividade */}
          <div className="relative flex items-center justify-center h-12 w-12">
            <svg className="w-full h-full transform -rotate-90">
              {/* Anel 1 (Kcal) Fundo */}
              <circle cx="24" cy="24" r={r1} className="stroke-slate-100" strokeWidth="3" fill="transparent" />
              {/* Anel 1 Real */}
              {stats.hasMeals && (
                <circle
                  cx="24"
                  cy="24"
                  r={r1}
                  className="stroke-rose-500 transition-all duration-300"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={circ1}
                  strokeDashoffset={offset1}
                  strokeLinecap="round"
                />
              )}

              {/* Anel 2 (Prot) Fundo */}
              <circle cx="24" cy="24" r={r2} className="stroke-slate-100" strokeWidth="3" fill="transparent" />
              {/* Anel 2 Real */}
              {stats.hasMeals && (
                <circle
                  cx="24"
                  cy="24"
                  r={r2}
                  className="stroke-emerald-500 transition-all duration-300"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={circ2}
                  strokeDashoffset={offset2}
                  strokeLinecap="round"
                />
              )}

              {/* Anel 3 (Carb) Fundo */}
              <circle cx="24" cy="24" r={r3} className="stroke-slate-100" strokeWidth="3" fill="transparent" />
              {/* Anel 3 Real */}
              {stats.hasMeals && (
                <circle
                  cx="24"
                  cy="24"
                  r={r3}
                  className="stroke-sky-500 transition-all duration-300"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={circ3}
                  strokeDashoffset={offset3}
                  strokeLinecap="round"
                />
              )}
            </svg>
            
            {/* Número do Dia Centralizado */}
            <span className={`absolute text-[10px] font-bold ${
              stats.hasMeals ? 'text-slate-800' : 'text-slate-400'
            }`}>
              {day}
            </span>
          </div>

          {/* Tooltip rápido se houver refeições */}
          {stats.hasMeals && (
            <span className="absolute bottom-1 text-[8px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              {stats.kcal} kcal
            </span>
          )}
        </button>
      )
    }

    // Preencher as últimas células da grade se necessário para fechar a última linha
    const totalCells = cells.length
    const remainingCells = (7 - (totalCells % 7)) % 7
    for (let i = 0; i < remainingCells; i++) {
      cells.push(<div key={`empty-end-${i}`} className="h-20 border-b border-r border-slate-100 bg-slate-50/30" />)
    }

    return cells
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Histórico de Alimentação</h1>
        <p className="text-sm text-slate-500">Navegue pelas refeições passadas e revise o progresso diário.</p>
      </div>

      {/* Grid: Calendário e Filtros/Lista */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Calendário de Anéis de Atividade (Esquerda) */}
        <div className="lg:col-span-7 rounded-[2rem] bg-white border border-slate-100 shadow-sm p-6 space-y-6">
          {/* Mês Navigator */}
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-lg font-bold text-slate-800">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-600"
              >
                <IconChevronLeft className="h-4 w-4 stroke-[2]" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-600"
              >
                <IconChevronRight className="h-4 w-4 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* Legenda de Anéis */}
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-100 justify-center sm:justify-start">
            <span className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded-full bg-rose-500 border border-rose-600/20 inline-block"></span>
              Calorias (meta)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 border border-emerald-600/20 inline-block"></span>
              Proteínas (meta)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded-full bg-sky-500 border border-sky-600/20 inline-block"></span>
              Carboidratos (meta)
            </span>
          </div>

          {/* Tabela do Calendário */}
          <div className="border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-xs">
            {/* Dias da semana cabeçalho */}
            <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-400 bg-slate-50 border-b border-slate-100 py-3 uppercase tracking-wider">
              <div>Dom</div>
              <div>Seg</div>
              <div>Ter</div>
              <div>Qua</div>
              <div>Qui</div>
              <div>Sex</div>
              <div>Sáb</div>
            </div>
            
            {/* Dias Grade */}
            <div className="grid grid-cols-7">
              {renderCalendarCells()}
            </div>
          </div>
        </div>

        {/* Filtros e Lista de Refeições (Direita) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Cabeçalho do Bloco da Direita */}
          <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-6 space-y-4">
            
            {selectedDateLabel ? (
              // Se tiver um dia selecionado no calendário
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visualizando Dia</span>
                  <h3 className="text-base font-bold text-slate-800">{selectedDateLabel}</h3>
                </div>
                <button
                  onClick={handleClearDaySelection}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all"
                >
                  Ver todos
                </button>
              </div>
            ) : (
              // Filtro global
              <div className="space-y-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filtrar Refeições</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'hoje', label: 'Hoje' },
                    { id: '7dias', label: '7 dias' },
                    { id: '30dias', label: '30 dias' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        setSelectedFilter(filter.id as any)
                        setSelectedDayMeals(null)
                      }}
                      className={`rounded-xl py-2 px-3 text-xs font-bold transition-all border ${
                        selectedFilter === filter.id
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-100'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setSelectedFilter('personalizado')
                      setSelectedDayMeals(null)
                    }}
                    className={`rounded-xl py-2 px-3 text-xs font-bold transition-all border ${
                      selectedFilter === 'personalizado'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-100'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Customizado
                  </button>
                </div>

                {/* Filtro personalizado de datas */}
                {selectedFilter === 'personalizado' && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">De</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Até</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lista de refeições filtradas */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {filteredMeals.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-slate-100">
                  <IconCalendarEvent className="h-6 w-6 stroke-[1.2]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">Sem registros neste período</h4>
                  <p className="text-xs text-slate-400">Nenhum prato encontrado com base nos filtros selecionados.</p>
                </div>
              </div>
            ) : (
              filteredMeals.map((meal) => (
                <div key={meal.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs flex items-center gap-4 hover:shadow-md transition-all duration-200">
                  {/* Minifoto */}
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-50">
                    <img src={meal.foto} alt="Refeição" className="h-full w-full object-cover" />
                  </div>
                  {/* Detalhes rápidos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        {new Date(meal.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} •{' '}
                        {new Date(meal.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-xs font-extrabold text-blue-600">{meal.calorias} kcal</span>
                    </div>
                    {/* Alimentos numa linha */}
                    <p className="text-xs text-slate-800 font-medium truncate mt-1">
                      {meal.items.map((item) => item.nome).join(', ')}
                    </p>
                    {/* Macros rápidos */}
                    <div className="flex gap-3 text-[10px] text-slate-400 font-bold uppercase mt-1">
                      <span>P: {meal.proteinas}g</span>
                      <span>C: {meal.carboidratos}g</span>
                      <span>G: {meal.gorduras}g</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
