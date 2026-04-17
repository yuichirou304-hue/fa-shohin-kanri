'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

interface QuoteItem {
  id: string; name: string; model: string; manufacturer: string
  quantity: number; unit: string; unit_price: number; amount: number
  dp_price: number; supplier: string; item_type: string
}

export default function NewOrderPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const versionId = searchParams.get('versionId') || ''

  const [items, setItems] = useState<QuoteItem[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({ order_number: '', order_date: '', customer_order_number: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!versionId) return
    fetch(`/api/projects/${params.id}/versions/${versionId}/items`)
      .then(r => r.json())
      .then(data => {
        setItems(data)
        // デフォルト全選択
        setSelected(new Set(data.map((i: QuoteItem) => i.id)))
      })
  }, [versionId, params.id])

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(items.map(i => i.id)) : new Set())
  }

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selected.size === 0) { alert('受注する品目を1つ以上選択してください') ; return }
    setSaving(true)
    const res = await fetch(`/api/projects/${params.id}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quote_version_id: versionId,
        ...form,
        selected_item_ids: Array.from(selected),
      }),
    })
    if (res.ok) {
      const order = await res.json()
      router.push(`/projects/${params.id}/orders/${order.id}`)
    } else {
      alert('受注登録に失敗しました')
      setSaving(false)
    }
  }

  const selectedItems = items.filter(i => selected.has(i.id))
  const totalAmount = selectedItems.reduce((s, i) => s + (Number(i.amount) || 0), 0)

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-slate-500 mb-1">案件 / 受注登録</p>
        <h2 className="text-2xl font-bold text-slate-800">受注登録</h2>
        <p className="text-slate-500 text-sm mt-1">受注する品目にチェックを入れてください</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 受注情報 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-slate-700 mb-4">受注情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">受注番号</label>
              <input type="text" value={form.order_number}
                onChange={e => setForm(p => ({ ...p, order_number: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="任意" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">受注日</label>
              <input type="date" value={form.order_date}
                onChange={e => setForm(p => ({ ...p, order_date: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">客先発注番号</label>
              <input type="text" value={form.customer_order_number}
                onChange={e => setForm(p => ({ ...p, customer_order_number: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* 品目選択 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
            <div className="flex items-center gap-3">
              <input type="checkbox"
                checked={selected.size === items.length && items.length > 0}
                onChange={e => toggleAll(e.target.checked)}
                className="rounded" />
              <span className="text-sm font-medium text-slate-700">全選択</span>
            </div>
            <span className="text-sm text-slate-500">{selected.size} / {items.length} 件選択</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-3 py-2 w-8"></th>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">品名</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">形式</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">メーカー</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">数量</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">御見積単価</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">御見積金額</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">仕入先</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(item => (
                  <tr key={item.id}
                    className={`cursor-pointer transition-colors ${selected.has(item.id) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    onClick={() => toggle(item.id)}
                  >
                    <td className="px-3 py-2 text-center">
                      <input type="checkbox" checked={selected.has(item.id)}
                        onChange={() => toggle(item.id)} onClick={e => e.stopPropagation()} className="rounded" />
                    </td>
                    <td className="px-3 py-2 text-slate-800">{item.name}</td>
                    <td className="px-3 py-2 text-slate-600 font-mono">{item.model || '-'}</td>
                    <td className="px-3 py-2 text-slate-600">{item.manufacturer || '-'}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">{item.unit_price ? `¥${Number(item.unit_price).toLocaleString()}` : '-'}</td>
                    <td className="px-3 py-2 text-right font-medium">{item.amount ? `¥${Number(item.amount).toLocaleString()}` : '-'}</td>
                    <td className="px-3 py-2 text-slate-500">{item.supplier || '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2">
                <tr>
                  <td colSpan={6} className="px-3 py-2 text-right font-medium text-slate-700">受注合計</td>
                  <td className="px-3 py-2 text-right font-bold text-blue-700">¥{totalAmount.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
            {saving ? '登録中...' : `${selected.size}件で受注登録する`}
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
