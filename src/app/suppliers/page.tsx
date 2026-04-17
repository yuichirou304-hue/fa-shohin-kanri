'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Supplier } from '@/lib/types'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    const res = await fetch(`/api/suppliers?${params}`)
    setSuppliers(await res.json())
    setLoading(false)
  }, [search])

  useEffect(() => { fetchSuppliers() }, [fetchSuppliers])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return
    await fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
    fetchSuppliers()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">仕入先マスタ</h2>
        <Link href="/suppliers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + 新規登録
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <input
          type="text"
          placeholder="会社名・仕入先コード・担当者名で検索"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-1/2"
        />
      </div>

      <p className="text-sm text-slate-500 mb-3">{loading ? '読み込み中...' : `${suppliers.length} 件`}</p>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">仕入先コード</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">会社名</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">担当者</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">電話番号</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">支払条件</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">状態</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && suppliers.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">仕入先が登録されていません</td></tr>
              )}
              {suppliers.map(s => (
                <tr key={s.id} className={`hover:bg-slate-50 transition-colors ${!s.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{s.code || '-'}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {s.company_name}
                    {s.department && <span className="text-slate-400 text-xs ml-2">{s.department}</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.contact_name || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.phone || '-'}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{s.payment_terms || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    {s.is_active
                      ? <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs">有効</span>
                      : <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs">停止</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Link href={`/suppliers/${s.id}/edit`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">編集</Link>
                      <button onClick={() => handleDelete(s.id, s.company_name)} className="text-red-500 hover:text-red-700 text-xs font-medium">削除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
