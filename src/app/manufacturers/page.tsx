'use client'

import { useEffect, useState } from 'react'
import { Manufacturer } from '@/lib/types'

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchManufacturers = async () => {
    const res = await fetch('/api/manufacturers')
    setManufacturers(await res.json())
  }

  useEffect(() => { fetchManufacturers() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    setError('')

    const res = await fetch('/api/manufacturers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || '登録に失敗しました')
    } else {
      setNewName('')
      fetchManufacturers()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`メーカー「${name}」を削除しますか？\n※商材に紐づいている場合は未選択になります。`)) return
    await fetch(`/api/manufacturers/${id}`, { method: 'DELETE' })
    fetchManufacturers()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">メーカー管理</h2>

      {/* 追加フォーム */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-slate-700 mb-4">メーカーを追加</h3>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="メーカー名を入力（例: KEYENCE, OMRON）"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            追加
          </button>
        </form>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {/* メーカー一覧 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">メーカー名</th>
              <th className="text-center px-4 py-3 font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {manufacturers.map(m => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">{m.name}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDelete(m.id, m.name)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
