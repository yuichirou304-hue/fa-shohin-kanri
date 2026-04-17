'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/projects', label: '案件管理' },
  { href: '/products', label: '商材マスタ' },
  { href: '/customers', label: '顧客マスタ' },
  { href: '/suppliers', label: '仕入先マスタ' },
  { href: '/categories', label: 'カテゴリ管理' },
  { href: '/manufacturers', label: 'メーカー管理' },
  { href: '/import', label: 'CSVインポート' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-slate-800 text-white flex flex-col z-10">
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-lg font-bold tracking-wide">FA商材管理</h1>
        <p className="text-slate-400 text-xs mt-1">商材データベース</p>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-slate-700 text-white border-l-4 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white border-l-4 border-transparent'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-6 py-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs">ver 1.0.0</p>
      </div>
    </aside>
  )
}
