'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  IconPlus,
  IconFlame,
  IconMeat,
  IconBread,
  IconDroplet,
  IconUpload,
  IconScan,
  IconTrash,
  IconCheck,
  IconClock,
  IconLoader,
  IconApple,
  IconSparkles
} from '@tabler/icons-react'

interface MealItem {
  id?: string
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

interface DashboardClientProps {
  initialMeals: any[]
  goals: {
    meta_calorias: number
    meta_proteinas: number
    meta_carboidratos: number
    meta_gorduras: number
  }
  userPlan?: string
  totalMealsCount?: number
}

export function DashboardClient({
  initialMeals,
  goals,
  userPlan = 'FREE',
  totalMealsCount = 0
}: DashboardClientProps) {
  const [meals, setMeals] = useState<Meal[]>(initialMeals)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPaywallOpen, setIsPaywallOpen] = useState(false)
  const [mealsCount, setMealsCount] = useState(totalMealsCount)

  const isPremium = userPlan === 'MENSAL' || userPlan === 'ANUAL'
  const isLimitReached = !isPremium && mealsCount >= 3

  const handleOpenAddMeal = () => {
    if (isLimitReached) {
      setIsPaywallOpen(true)
    } else {
      setIsModalOpen(true)
    }
  }
  
  // Estados do upload e análise
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mealDescription, setMealDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState('')
  const [analyzedData, setAnalyzedData] = useState<{
    items: MealItem[]
    calorias_totais: number
    proteinas_totais: number
    carboidratos_totais: number
    gorduras_totais: number
  } | null>(null)

  // Estados de edição de alimentos no modal
  const [newItemName, setNewItemName] = useState('')
  const [newItemGrams, setNewItemGrams] = useState(100)
  const [newItemKcal, setNewItemKcal] = useState(100)
  const [newItemProt, setNewItemProt] = useState(10)
  const [newItemCarb, setNewItemCarb] = useState(10)
  const [newItemFat, setNewItemFat] = useState(2)
  const [showAddForm, setShowAddForm] = useState(false)

  // Mensagens de erro ou sucesso
  const [modalError, setModalError] = useState<string | null>(null)

  // 1. Cálculos do dia
  const totalCalorias = meals.reduce((acc, m) => acc + m.calorias, 0)
  const totalProteinas = Number(meals.reduce((acc, m) => acc + m.proteinas, 0).toFixed(1))
  const totalCarboidratos = Number(meals.reduce((acc, m) => acc + m.carboidratos, 0).toFixed(1))
  const totalGorduras = Number(meals.reduce((acc, m) => acc + m.gorduras, 0).toFixed(1))

  const pctCalorias = Math.min(100, Math.round((totalCalorias / goals.meta_calorias) * 100))
  const pctProteinas = Math.min(100, Math.round((totalProteinas / goals.meta_proteinas) * 100))
  const pctCarboidratos = Math.min(100, Math.round((totalCarboidratos / goals.meta_carboidratos) * 100))
  const pctGorduras = Math.min(100, Math.round((totalGorduras / goals.meta_gorduras) * 100))

  // 2. Fluxo de Arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setAnalyzedData(null)
      setModalError(null)
    }
  }

  // 3. Analisar prato por IA
  const handleAnalyze = async () => {
    if (!file) return

    setUploading(true)
    setModalError(null)
    setAnalysisStep('Enviando imagem...')

    try {
      // a. Fazer upload da imagem
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!uploadRes.ok) {
        const uploadErrData = await uploadRes.json()
        throw new Error(uploadErrData.error || 'Erro ao realizar upload da imagem.')
      }

      const { url } = await uploadRes.json()
      
      setUploading(false)
      setAnalyzing(true)
      
      // Passos realistas de carregamento da IA
      setAnalysisStep('Processando imagem do prato...')
      setTimeout(() => setAnalysisStep('Identificando alimentos...'), 600)
      setTimeout(() => setAnalysisStep('Estimando porções em gramas...'), 1200)

      // b. Analisar imagem via OpenAI (com descrição opcional do usuário)
      const analyzeRes = await fetch('/api/meals/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, description: mealDescription.trim() || undefined }),
      })

      if (!analyzeRes.ok) {
        const analyzeErrData = await analyzeRes.json()
        throw new Error(analyzeErrData.error || 'Erro na análise da inteligência artificial.')
      }

      const analyzeResult = await analyzeRes.json()
      
      // Definir resultado no formulário de revisão
      setAnalyzedData({
        ...analyzeResult,
        fotoUrl: url // Adicionando a URL retornada da imagem
      })
    } catch (err: any) {
      setModalError(err.message || 'Falha ao analisar a refeição. Tente novamente.')
    } finally {
      setUploading(false)
      setAnalyzing(false)
      setAnalysisStep('')
    }
  }

  // 4. Edições de itens alimentares no modal
  const handleItemChange = (index: number, field: keyof MealItem, val: string | number) => {
    if (!analyzedData) return
    const updatedItems = [...analyzedData.items]
    const item = { ...updatedItems[index] }

    if (field === 'quantidade_gramas') {
      const novaQtd = Number(val)
      const antigaQtd = item.quantidade_gramas || 1
      const fator = novaQtd / antigaQtd

      // Recalcular macros proporcionalmente
      item.quantidade_gramas = novaQtd
      item.calorias = Math.round(item.calorias * fator)
      item.proteinas = Number((item.proteinas * fator).toFixed(1))
      item.carboidratos = Number((item.carboidratos * fator).toFixed(1))
      item.gorduras = Number((item.gorduras * fator).toFixed(1))
    } else if (field === 'nome') {
      item.nome = String(val)
    } else {
      item[field] = Number(val) as never
    }

    updatedItems[index] = item

    // Recalcular totais da refeição
    const calorias_totais = updatedItems.reduce((acc, i) => acc + i.calorias, 0)
    const proteinas_totais = Number(updatedItems.reduce((acc, i) => acc + i.proteinas, 0).toFixed(1))
    const carboidratos_totais = Number(updatedItems.reduce((acc, i) => acc + i.carboidratos, 0).toFixed(1))
    const gorduras_totais = Number(updatedItems.reduce((acc, i) => acc + i.gorduras, 0).toFixed(1))

    setAnalyzedData({
      ...analyzedData,
      items: updatedItems,
      calorias_totais,
      proteinas_totais,
      carboidratos_totais,
      gorduras_totais
    })
  }

  const handleDeleteItem = (index: number) => {
    if (!analyzedData) return
    const updatedItems = analyzedData.items.filter((_, i) => i !== index)

    const calorias_totais = updatedItems.reduce((acc, i) => acc + i.calorias, 0)
    const proteinas_totais = Number(updatedItems.reduce((acc, i) => acc + i.proteinas, 0).toFixed(1))
    const carboidratos_totais = Number(updatedItems.reduce((acc, i) => acc + i.carboidratos, 0).toFixed(1))
    const gorduras_totais = Number(updatedItems.reduce((acc, i) => acc + i.gorduras, 0).toFixed(1))

    setAnalyzedData({
      ...analyzedData,
      items: updatedItems,
      calorias_totais,
      proteinas_totais,
      carboidratos_totais,
      gorduras_totais
    })
  }

  const handleAddItem = () => {
    if (!analyzedData || !newItemName) return

    const newItem: MealItem = {
      nome: newItemName,
      quantidade_gramas: Number(newItemGrams),
      calorias: Math.round(newItemKcal),
      proteinas: Number(newItemProt),
      carboidratos: Number(newItemCarb),
      gorduras: Number(newItemFat),
    }

    const updatedItems = [...analyzedData.items, newItem]

    const calorias_totais = updatedItems.reduce((acc, i) => acc + i.calorias, 0)
    const proteinas_totais = Number(updatedItems.reduce((acc, i) => acc + i.proteinas, 0).toFixed(1))
    const carboidratos_totais = Number(updatedItems.reduce((acc, i) => acc + i.carboidratos, 0).toFixed(1))
    const gorduras_totais = Number(updatedItems.reduce((acc, i) => acc + i.gorduras, 0).toFixed(1))

    setAnalyzedData({
      ...analyzedData,
      items: updatedItems,
      calorias_totais,
      proteinas_totais,
      carboidratos_totais,
      gorduras_totais
    })

    // Reset formulário add
    setNewItemName('')
    setNewItemGrams(100)
    setNewItemKcal(100)
    setNewItemProt(10)
    setNewItemCarb(10)
    setNewItemFat(2)
    setShowAddForm(false)
  }

  // 5. Salvar Refeição Definitivamente
  const handleSaveMeal = async () => {
    if (!analyzedData) return

    setUploading(true)

    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foto: (analyzedData as any).fotoUrl || previewUrl,
          calorias: analyzedData.calorias_totais,
          proteinas: analyzedData.proteinas_totais,
          carboidratos: analyzedData.carboidratos_totais,
          gorduras: analyzedData.gorduras_totais,
          fibras: 0,
          items: analyzedData.items,
        }),
      })

      if (!response.ok) {
        throw new Error('Falha ao salvar a refeição no banco de dados.')
      }

      const savedMeal = await response.json()
      
      // Atualizar estado de refeições do dia
      setMeals((prev) => [savedMeal, ...prev])
      setMealsCount((prev) => prev + 1)

      // Fechar modal e resetar estados
      setIsModalOpen(false)
      setFile(null)
      setPreviewUrl(null)
      setMealDescription('')
      setAnalyzedData(null)
    } catch (err: any) {
      setModalError(err.message || 'Falha ao salvar a refeição.')
    } finally {
      setUploading(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFile(null)
    setPreviewUrl(null)
    setMealDescription('')
    setAnalyzedData(null)
    setModalError(null)
    setShowAddForm(false)
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Seu Painel Diário</h1>
          <p className="text-sm text-slate-500">Monitore sua alimentação de hoje e alcance suas metas.</p>
        </div>
        <button
          onClick={handleOpenAddMeal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
        >
          <IconPlus className="h-5 w-5 stroke-[2]" />
          Adicionar Refeição
        </button>
      </div>

      {/* Progress Cards & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calories Progress (Circular/Large Card) */}
        <div className="lg:col-span-5 rounded-[2rem] bg-white p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <span className="absolute top-4 left-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Calorias de Hoje</span>
          
          {/* Circular progress SVG */}
          <div className="relative flex items-center justify-center h-48 w-48 mt-4">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="96"
                cy="96"
                r="80"
                className="stroke-slate-100"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Animated progress circle */}
              <circle
                cx="96"
                cy="96"
                r="80"
                className="stroke-blue-600"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - pctCalorias / 100)}
                style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="block text-4xl font-extrabold text-slate-900 tracking-tight">{totalCalorias}</span>
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">de {goals.meta_calorias} kcal</span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
              <IconFlame className="h-4 w-4 stroke-[1.5]" />
              {pctCalorias}% concluído
            </span>
          </div>
        </div>

        {/* Macros Progress Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Proteína */}
          <div className="rounded-[2rem] bg-white p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <IconMeat className="h-5 w-5 stroke-[1.5]" />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {pctProteinas}%
              </span>
            </div>
            <div className="mt-8">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Proteínas</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-800">{totalProteinas}g</span>
                <span className="text-xs text-slate-400 font-medium">/ {goals.meta_proteinas}g</span>
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${pctProteinas}%`, transition: 'width 1s ease-out' }}
                />
              </div>
            </div>
          </div>

          {/* Carboidrato */}
          <div className="rounded-[2rem] bg-white p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <IconBread className="h-5 w-5 stroke-[1.5]" />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {pctCarboidratos}%
              </span>
            </div>
            <div className="mt-8">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Carboidratos</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-800">{totalCarboidratos}g</span>
                <span className="text-xs text-slate-400 font-medium">/ {goals.meta_carboidratos}g</span>
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${pctCarboidratos}%`, transition: 'width 1s ease-out' }}
                />
              </div>
            </div>
          </div>

          {/* Gordura */}
          <div className="rounded-[2rem] bg-white p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <IconDroplet className="h-5 w-5 stroke-[1.5]" />
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                {pctGorduras}%
              </span>
            </div>
            <div className="mt-8">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Gorduras</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-800">{totalGorduras}g</span>
                <span className="text-xs text-slate-400 font-medium">/ {goals.meta_gorduras}g</span>
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${pctGorduras}%`, transition: 'width 1s ease-out' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refeições de Hoje */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Refeições de Hoje</h2>

        {meals.length === 0 ? (
          /* Empty State */
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 border border-slate-100">
              <IconApple className="h-8 w-8 stroke-[1.2]" />
            </div>
            <div className="space-y-1 max-w-[280px]">
              <h3 className="text-base font-bold text-slate-800">Nenhuma refeição registrada</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Você ainda não registrou suas refeições de hoje. Tire uma foto para começar.</p>
            </div>
            <button
              onClick={handleOpenAddMeal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
            >
              Registrar Primeiro Prato
            </button>
          </div>
        ) : (
          /* List of meals */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meals.map((meal) => (
              <div key={meal.id} className="rounded-[2rem] bg-white border border-slate-100 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
                {/* Photo & Time badge */}
                <div className="relative h-48 bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-50">
                  <img
                    src={meal.foto}
                    alt="Refeição"
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-semibold text-white shadow-xs backdrop-blur-xs">
                    <IconClock className="h-3.5 w-3.5" />
                    {new Date(meal.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-1 rounded-lg bg-blue-600/90 px-2.5 py-1 text-xs font-bold text-white shadow-xs backdrop-blur-xs">
                    {meal.calorias} kcal
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Alimentos identificados */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Alimentos identificados</span>
                      <div className="flex flex-wrap gap-1.5">
                        {meal.items?.map((item, idx) => (
                          <span key={idx} className="inline-flex items-center rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {item.nome} • {item.quantidade_gramas}g
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary of macros in line */}
                  <div className="mt-6 border-t border-slate-50 pt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Prot</span>
                      <span className="font-extrabold text-slate-800">{meal.proteinas}g</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Carb</span>
                      <span className="font-extrabold text-slate-800">{meal.carboidratos}g</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Gord</span>
                      <span className="font-extrabold text-slate-800">{meal.gorduras}g</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Adicionar Refeição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={handleCloseModal}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Content Container */}
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] transition-all duration-300 transform scale-100 opacity-100"
          >
              {/* Header */}
              <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <IconScan className="h-5 w-5 text-blue-600 stroke-[2]" />
                  Adicionar Refeição por Foto
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-50 transition-colors"
                >
                  Fechar
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {modalError && (
                  <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                    <p className="text-sm font-semibold text-red-800">{modalError}</p>
                  </div>
                )}

                {/* Fluxo 1: Upload e Enviar */}
                {!analyzedData && !uploading && !analyzing && (
                  <div className="space-y-6">
                    {/* Dropzone area */}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        id="meal-photo-input"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      {!previewUrl ? (
                        <label
                          htmlFor="meal-photo-input"
                          className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 p-12 text-center cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all group"
                        >
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 border border-slate-100 shadow-xs mb-4 group-hover:text-blue-500 group-hover:shadow-md transition-all">
                            <IconUpload className="h-6 w-6 stroke-[1.5]" />
                          </div>
                          <span className="block text-sm font-bold text-slate-800">Escolha ou tire uma foto</span>
                          <span className="block text-xs text-slate-400 mt-1">PNG, JPG de até 5MB</span>
                        </label>
                      ) : (
                        <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center bg-slate-100 h-64">
                          <img
                            src={previewUrl}
                            alt="Preview da refeição"
                            className="h-full w-full object-cover"
                          />
                          <label
                            htmlFor="meal-photo-input"
                            className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-2 text-xs font-bold text-white shadow-xs backdrop-blur-xs cursor-pointer hover:bg-black/85"
                          >
                            Alterar Foto
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Campo de descrição do prato */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Descrição do prato
                        <span className="ml-1.5 font-normal text-slate-400 normal-case tracking-normal">(opcional, mas ajuda a IA)</span>
                      </label>
                      <textarea
                        value={mealDescription}
                        onChange={(e) => setMealDescription(e.target.value)}
                        placeholder="Ex: Arroz, feijão e frango grelhado com salada. Prato grande, porção generosa."
                        rows={3}
                        maxLength={300}
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                      />
                      <p className="text-[10px] text-slate-400 text-right">{mealDescription.length}/300 caracteres</p>
                    </div>

                    {previewUrl && (
                      <button
                        onClick={handleAnalyze}
                        className="flex w-full justify-center items-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-100 hover:bg-blue-700 transition-all active:scale-98"
                      >
                        <IconScan className="h-4 w-4 stroke-[2]" />
                        Analisar com IA Nutricional
                      </button>
                    )}
                  </div>
                )}

                {/* Fluxo 2: Carregamento/Escaneamento */}
                {(uploading || analyzing) && (
                  <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
                    <div className="relative h-48 w-48 rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-100">
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Preview do escaneamento"
                          className="h-full w-full object-cover opacity-80"
                        />
                      )}
                      {/* Scanline line overlay */}
                      <div
                        className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_10px_#2563EB] animate-scan"
                      />
                    </div>
                    <div className="space-y-2 max-w-[280px]">
                      <div className="flex items-center justify-center gap-2">
                        <IconLoader className="h-5 w-5 animate-spin text-blue-600" />
                        <h4 className="text-base font-bold text-slate-800">IA analisando seu prato</h4>
                      </div>
                      <p className="text-xs text-slate-400 font-mono tracking-wide uppercase">{analysisStep}</p>
                    </div>
                  </div>
                )}

                {/* Fluxo 3: Tela de Edição e Revisão */}
                {analyzedData && (
                  <div className="space-y-6">
                    {/* Alimentos Editáveis */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Itens e porções estimadas</span>
                        <button
                          onClick={() => setShowAddForm(!showAddForm)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <IconPlus className="h-3.5 w-3.5 stroke-[2.5]" />
                          Inserir item manual
                        </button>
                      </div>

                      {/* Formulário para inserção manual de novo item */}
                      {showAddForm && (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                          <h4 className="text-xs font-bold text-slate-700">Novo alimento</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Nome do alimento (ex. Arroz)"
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              className="col-span-2 block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-hidden bg-white"
                            />
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 uppercase font-semibold">Peso (g)</label>
                              <input
                                type="number"
                                value={newItemGrams}
                                onChange={(e) => setNewItemGrams(Number(e.target.value))}
                                className="block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-hidden bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 uppercase font-semibold">Kcal</label>
                              <input
                                type="number"
                                value={newItemKcal}
                                onChange={(e) => setNewItemKcal(Number(e.target.value))}
                                className="block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-hidden bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 uppercase font-semibold">Prot (g)</label>
                              <input
                                type="number"
                                value={newItemProt}
                                onChange={(e) => setNewItemProt(Number(e.target.value))}
                                className="block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-hidden bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 uppercase font-semibold">Carb (g)</label>
                              <input
                                type="number"
                                value={newItemCarb}
                                onChange={(e) => setNewItemCarb(Number(e.target.value))}
                                className="block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-hidden bg-white"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              onClick={() => setShowAddForm(false)}
                              className="rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleAddItem}
                              className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-[10px] font-bold"
                            >
                              Adicionar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Lista de alimentos com inputs */}
                      <div className="space-y-3">
                        {analyzedData.items.map((item, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-3">
                            <div className="flex-1 space-y-1.5">
                              <input
                                type="text"
                                value={item.nome}
                                onChange={(e) => handleItemChange(idx, 'nome', e.target.value)}
                                className="font-bold text-sm text-slate-800 bg-transparent hover:bg-slate-100 px-2 py-0.5 rounded-md focus:bg-white focus:outline-hidden border-b border-transparent focus:border-slate-300 w-full"
                              />
                              <div className="flex items-center gap-4 text-xs text-slate-400 px-2">
                                <span>{item.calorias} kcal</span>
                                <span>P: {item.proteinas}g</span>
                                <span>C: {item.carboidratos}g</span>
                                <span>G: {item.gorduras}g</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  value={item.quantidade_gramas}
                                  onChange={(e) => handleItemChange(idx, 'quantidade_gramas', Number(e.target.value))}
                                  className="w-16 text-center rounded-lg border border-slate-200 bg-white py-1 text-xs font-bold text-slate-800 focus:outline-hidden"
                                />
                                <span className="text-xs text-slate-400 font-bold uppercase">g</span>
                              </div>
                              
                              <button
                                onClick={() => handleDeleteItem(idx)}
                                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 active:scale-95"
                                title="Remover item"
                              >
                                <IconTrash className="h-4 w-4 stroke-[1.5]" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resumo da Refeição */}
                    <div className="rounded-[2.5rem] bg-blue-50/50 p-6 border border-blue-100/30">
                      <span className="block text-[10px] font-bold text-blue-500 uppercase tracking-wider text-center">Totais Estimados da Refeição</span>
                      <div className="grid grid-cols-4 gap-4 text-center mt-4">
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Kcal</span>
                          <span className="text-lg font-extrabold text-blue-600">{analyzedData.calorias_totais}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Prot</span>
                          <span className="text-lg font-extrabold text-slate-800">{analyzedData.proteinas_totais}g</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Carb</span>
                          <span className="text-lg font-extrabold text-slate-800">{analyzedData.carboidratos_totais}g</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Gord</span>
                          <span className="text-lg font-extrabold text-slate-800">{analyzedData.gorduras_totais}g</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {analyzedData && (
                <div className="border-t border-slate-100 px-6 py-4 flex gap-4 justify-end">
                  <button
                    onClick={handleCloseModal}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={handleSaveMeal}
                    disabled={uploading || analyzedData.items.length === 0}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-100 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <IconCheck className="h-4 w-4 stroke-[2.5]" />
                    Salvar Refeição
                  </button>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Modal Paywall Premium */}
      {isPaywallOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setIsPaywallOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Content Container */}
          <div
            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl border border-slate-100 text-center flex flex-col items-center transition-all duration-300 transform scale-100 opacity-100"
          >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 shadow-md shadow-amber-50/50 mb-6 animate-pulse">
                <IconSparkles className="h-8 w-8 stroke-[1.5]" />
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                Limite Gratuito Atingido
              </h3>
              
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Você registrou com sucesso suas 3 refeições gratuitas de teste! Para continuar analisando pratos por inteligência artificial, assine um de nossos planos Premium.
              </p>

              {/* Benefícios */}
              <div className="w-full bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3 mb-8">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <IconCheck className="h-4 w-4 text-emerald-500 stroke-[3]" />
                  <span>Análise de Fotos por IA Ilimitada</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <IconCheck className="h-4 w-4 text-emerald-500 stroke-[3]" />
                  <span>Histórico Completo Sem Restrições</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <IconCheck className="h-4 w-4 text-emerald-500 stroke-[3]" />
                  <span>Estatísticas e Recordes de Aderência</span>
                </div>
              </div>

              <div className="w-full space-y-3">
                <Link
                  href="/precos"
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-100 hover:bg-blue-700 transition-all active:scale-98"
                >
                  Ver Planos de Assinatura
                </Link>
                
                <button
                  onClick={() => setIsPaywallOpen(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors py-2"
                >
                  Voltar ao painel
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  )
}
