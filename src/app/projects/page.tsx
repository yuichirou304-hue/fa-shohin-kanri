'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  quote_number: string
  customer_name: string
  project_name: string
  quote_date: string
  status: string
  customer?: { company_name: string }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  quoting: { label: '見積中', color: 'bg-yellow-100 text-yellow-700' },
  ordered: { label: '受注済', color: 'bg-blue-100 text-blue-700' },
  completed: { label: '完了', color: 'bg-green-100 text-green-700' },
  lost: { label: '失注', color: 'bg-red-100 text-red-600' },
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    const res = await fetch(`/api/projects?${params}`)
    setProjects(await res.json())
    setLoading(false)
  }, [search, status])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    fetchProjects()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">案件管理</h2>
        <Link href="/projects/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + 新規案件
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="見積番号・案件名・顧客名で検索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          />
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ステータス: すべて</option>
            <option value="quoting">見積中</option>
            <option value="ordered">受注済</option>
            <option value="completed">完了</option>
            <option value="lost">失注</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-3">{loading ? '読み込み中...' : `${projects.length} 件`}</p>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">見積番号</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">案件名（物件名）</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">顧客</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">見積日</th>
              <th className="text-center px-4 py-3 font-medium text-slate-600">ステータス</th>
              <th className="text-center px-4 py-3 font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!loading && projects.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">案件が登録されていません</td></tr>
            )}
            {projects.map(p => {
              const st = STATUS_LABELS[p.status] || { label: p.status, color: 'bg-gray-100 text-gray-600' }
              return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.quote_number}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    <Link href={`/projects/${p.id}`} className="hover:text-blue-600 hover:underline">
                      {p.project_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.customer?.company_name || p.customer_name || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{p.quote_date || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs ${st.color}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Link href={`/projects/${p.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">詳細</Link>
                      <button onClick={() => handleDelete(p.id, p.project_name)} className="text-red-500 hover:text-red-700 text-xs font-medium">削除</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
