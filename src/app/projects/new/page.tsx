'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProjectPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<{ id: string; company_name: string }[]>([])
  const [form, setForm] = useState({
    quote_number: '',
    customer_id: '',
    customer_name: '',
    project_name: '',
    quote_date: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.quote_number || !form.project_name) {
      setError('見積番号と案件名は必須です')
      return
    }
    setSaving(true)
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || '登録に失敗しました')
      setSaving(false)
      return
    }
    const project = await res.json()
    router.push(`/projects/${project.id}`)
  }

  const fieldClass = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'
  const labelClass = 'block text-xs font-medium text-slate-600 mb-1'

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">新規案件登録</h2>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div>
            <label className={labelClass}>見積番号 <span className="text-red-500">*</span></label>
            <input type="text" name="quote_number" value={form.quote_number} onChange={handleChange}
              className={fieldClass} placeholder="例: NFEEC74000415A" required />
            <p className="text-xs text-slate-400 mt-1">ExcelでつけたもWidgetをそのまま入力してください</p>
          </div>
          <div>
            <label className={labelClass}>案件名（物件名） <span className="text-red-500">*</span></label>
            <input type="text" name="project_name" value={form.project_name} onChange={handleChange}
              className={fieldClass} placeholder="例: 荏原製作所 藤沢事業所 制御盤" required />
          </div>
          <div>
            <label className={labelClass}>顧客（マスタから選択）</label>
            <select name="customer_id" value={form.customer_id} onChange={handleChange} className={fieldClass}>
              <option value="">未選択（直接入力する場合）</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>
          {!form.customer_id && (
            <div>
              <label className={labelClass}>顧客名（直接入力）</label>
              <input type="text" name="customer_name" value={form.customer_name} onChange={handleChange}
                className={fieldClass} placeholder="例: 富士電機E&C株式会社" />
            </div>
          )}
          <div>
            <label className={labelClass}>見積日</label>
            <input type="date" name="quote_date" value={form.quote_date} onChange={handleChange} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>備考</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className={fieldClass} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
            {saving ? '登録中...' : '案件を登録する'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="bg-white hover:bg-gray-50 text-slate-700 border border-gray-300 px-6 py-2 rounded-lg text-sm font-medium">
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}
