'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  IconApple,
  IconCalendar,
  IconChartBar,
  IconTargetArrow,
  IconLogout,
  IconUser,
  IconMenu2,
  IconX,
  IconSparkles
} from '@tabler/icons-react'
import { useState } from 'react'

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Painel', href: '/dashboard', icon: IconApple },
    { label: 'Histórico', href: '/historico', icon: IconCalendar },
    { label: 'Estatísticas', href: '/estatisticas', icon: IconChartBar },
    { label: 'Metas', href: '/metas', icon: IconTargetArrow },
  ]

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
            <IconApple className="h-6 w-6 stroke-[1.5]" />
          </div>
          <span className="tracking-tight">CalorieTrack<span className="text-slate-900 font-semibold font-mono text-sm ml-1 bg-slate-100 px-1.5 py-0.5 rounded-md">AI</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4 stroke-[1.5]" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Profile & Sign Out (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {session?.user && (
            <>
              {session.user.plano !== 'MENSAL' && session.user.plano !== 'ANUAL' ? (
                <Link
                  href="/precos"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 hover:shadow-md transition-all active:scale-95 animate-pulse-slow"
                >
                  <IconSparkles className="h-4 w-4" />
                  Seja Premium
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 border border-amber-500/20">
                  ★ PRO
                </span>
              )}
            </>
          )}

          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100">
            <IconUser className="h-4 w-4 text-slate-500 stroke-[1.5]" />
            <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate">
              {session?.user?.name || 'Usuário'}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:bg-red-50 hover:border-red-100 hover:text-red-600 active:scale-95"
            title="Sair da conta"
          >
            <IconLogout className="h-4 w-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={toggleMobileMenu}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 md:hidden hover:bg-slate-50 active:scale-95"
        >
          {mobileMenuOpen ? (
            <IconX className="h-5 w-5 stroke-[1.5]" />
          ) : (
            <IconMenu2 className="h-5 w-5 stroke-[1.5]" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden shadow-inner space-y-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-5 w-5 stroke-[1.5]" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-col gap-3">
            {session?.user && session.user.plano !== 'MENSAL' && session.user.plano !== 'ANUAL' && (
              <Link
                href="/precos"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                <IconSparkles className="h-4 w-4" />
                Seja Premium
              </Link>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 border border-slate-100 flex-1 mr-3">
                <IconUser className="h-4 w-4 text-slate-500 stroke-[1.5]" />
                <span className="text-xs font-medium text-slate-700 truncate max-w-[150px]">
                  {session?.user?.name || 'Usuário'}
                </span>
                {session?.user && (session.user.plano === 'MENSAL' || session.user.plano === 'ANUAL') && (
                  <span className="ml-auto inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-500/20">
                    PRO
                  </span>
                )}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50/50 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
              >
                <IconLogout className="h-4 w-4 stroke-[1.5]" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
