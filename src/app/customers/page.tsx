'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Customer } from '@/lib/types'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    const res = await fetch(`/api/customers?${params}`)
    setCustomers(await res.json())
    setLoading(false)
  }, [search])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return
    await fetch(`/api/customers/${id}`, { method: 'DELETE' })
    fetchCustomers()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">顧客マスタ</h2>
        <Link href="/customers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + 新規登録
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <input
          type="text"
          placeholder="会社名・顧客コード・担当者名で検索"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-1/2"
        />
      </div>

      <p className="text-sm text-slate-500 mb-3">{loading ? '読み込み中...' : `${customers.length} 件`}</p>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">顧客コード</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">会社名</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">担当者</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">電話番号</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">支払条件</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">状態</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && customers.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">顧客が登録されていません</td></tr>
              )}
              {customers.map(c => (
                <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${!c.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{c.code || '-'}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {c.company_name}
                    {c.department && <span className="text-slate-400 text-xs ml-2">{c.department}</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.contact_name || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{c.phone || '-'}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{c.payment_terms || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    {c.is_active
                      ? <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs">有効</span>
                      : <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs">停止</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Link href={`/customers/${c.id}/edit`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">編集</Link>
                      <button onClick={() => handleDelete(c.id, c.company_name)} className="text-red-500 hover:text-red-700 text-xs font-medium">削除</button>
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
