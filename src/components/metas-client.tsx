'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconTargetArrow,
  IconFlame,
  IconMeat,
  IconBread,
  IconDroplet,
  IconCheck,
  IconLoader
} from '@tabler/icons-react'

interface Goals {
  meta_calorias: number
  meta_proteinas: number
  meta_carboidratos: number
  meta_gorduras: number
}

interface MetasClientProps {
  initialGoals: Goals
}

export function MetasClient({ initialGoals }: MetasClientProps) {
  const router = useRouter()
  const [goals, setGoals] = useState<Goals>(initialGoals)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof Goals, val: number) => {
    setGoals({
      ...goals,
      [field]: val,
    })
    setSuccess(false)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError(null)

    try {
      const response = await fetch('/api/user/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goals),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar as metas nutricionais.')
      }

      setSuccess(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Falha na conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Suas Metas Diárias</h1>
        <p className="text-sm text-slate-500">Configure suas necessidades calóricas e de macronutrientes recomendadas.</p>
      </div>

      {/* Form Container */}
      <div className="rounded-[2.5rem] bg-white border border-slate-100 shadow-xl p-8 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Feedbacks */}
          {error && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-100">
              <p className="text-sm font-semibold text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100 flex items-center gap-2">
              <IconCheck className="h-5 w-5 text-emerald-600 stroke-[2.5]" />
              <p className="text-sm font-semibold text-emerald-800">Suas metas foram atualizadas com sucesso!</p>
            </div>
          )}

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            
            {/* Meta Calorias */}
            <div className="space-y-2">
              <label htmlFor="meta_calorias" className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                  <IconFlame className="h-4 w-4 stroke-[2]" />
                </div>
                Meta de Calorias (kcal)
              </label>
              <input
                id="meta_calorias"
                type="number"
                required
                value={goals.meta_calorias}
                onChange={(e) => handleChange('meta_calorias', Number(e.target.value))}
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-inner bg-slate-50/50 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden transition-all text-sm font-bold"
              />
              <span className="block text-[11px] text-slate-400">Quantidade de calorias para manutenção, queima ou ganho.</span>
            </div>

            {/* Meta Proteínas */}
            <div className="space-y-2">
              <label htmlFor="meta_proteinas" className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                  <IconMeat className="h-4 w-4 stroke-[2]" />
                </div>
                Meta de Proteínas (g)
              </label>
              <input
                id="meta_proteinas"
                type="number"
                required
                value={goals.meta_proteinas}
                onChange={(e) => handleChange('meta_proteinas', Number(e.target.value))}
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-inner bg-slate-50/50 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden transition-all text-sm font-bold"
              />
              <span className="block text-[11px] text-slate-400">Importante para a manutenção e crescimento muscular.</span>
            </div>

            {/* Meta Carboidratos */}
            <div className="space-y-2">
              <label htmlFor="meta_carboidratos" className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                  <IconBread className="h-4 w-4 stroke-[2]" />
                </div>
                Meta de Carboidratos (g)
              </label>
              <input
                id="meta_carboidratos"
                type="number"
                required
                value={goals.meta_carboidratos}
                onChange={(e) => handleChange('meta_carboidratos', Number(e.target.value))}
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-inner bg-slate-50/50 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden transition-all text-sm font-bold"
              />
              <span className="block text-[11px] text-slate-400">Principal fonte de energia diária para o organismo.</span>
            </div>

            {/* Meta Gorduras */}
            <div className="space-y-2">
              <label htmlFor="meta_gorduras" className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                  <IconDroplet className="h-4 w-4 stroke-[2]" />
                </div>
                Meta de Gorduras (g)
              </label>
              <input
                id="meta_gorduras"
                type="number"
                required
                value={goals.meta_gorduras}
                onChange={(e) => handleChange('meta_gorduras', Number(e.target.value))}
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-inner bg-slate-50/50 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden transition-all text-sm font-bold"
              />
              <span className="block text-[11px] text-slate-400">Nutriente essencial para regulação hormonal saudável.</span>
            </div>

          </div>

          {/* Submit Button */}
          <div className="border-t border-slate-100 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-100 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <IconLoader className="h-4 w-4 animate-spin" />
                  Salvando metas...
                </>
              ) : (
                <>
                  <IconTargetArrow className="h-5 w-5 stroke-[2]" />
                  Salvar Metas
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
