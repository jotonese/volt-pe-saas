'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  Target,
  Users,
  FileSpreadsheet,
  Settings,
  Briefcase,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Fundos de PE', href: '/fundos', icon: Building2 },
  { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { name: 'Investidas (Add-ons)', href: '/investidas', icon: Target },
  { name: 'Interações', href: '/interacoes', icon: Users },
  { name: 'Importar Excel', href: '/importar', icon: FileSpreadsheet },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold">
          V
        </div>
        <div>
          <h1 className="font-semibold text-lg">Volt Partners</h1>
          <p className="text-xs text-slate-400">PE Research</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
        <Link
          href="/configuracoes"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Settings className="h-5 w-5" />
          Configurações
        </Link>
        <div className="mt-4 px-3">
          <p className="text-xs text-slate-500">
            Volt Partners © 2025
          </p>
        </div>
      </div>
    </aside>
  )
}
