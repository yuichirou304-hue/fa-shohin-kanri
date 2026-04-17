'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface OrderItem {
  id: string; name: string; model: string; manufacturer: string
  quantity: number; unit: string; unit_price: number; amount: number
  dp_price: number; supplier: string; item_type: string
}
interface PurchaseOrder {
  id: string; supplier_name: string; po_date: string; po_number: string
  items: { id: string; name: string; quantity: number; unit_price: number; amount: number }[]
}
interface Order {
  id: string; order_number: string; order_date: string; customer_order_number: string
  notes: string; items: OrderItem[]; purchase_orders: PurchaseOrder[]
  project_id: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [poDate, setPoDate] = useState('')

  const fetchOrder = async () => {
    const res = await fetch(`/api/projects/${params.id}/orders/${params.orderId}`)
    setOrder(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchOrder() }, [params.id, params.orderId])

  const handleGeneratePOs = async () => {
    if (!confirm('仕入先別に発注書を自動生成します。既存の発注書は上書きされます。よろしいですか？')) return
    setGenerating(true)
    await fetch(`/api/projects/${params.id}/orders/${params.orderId}/purchase-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ po_date: poDate }),
    })
    await fetchOrder()
    setGenerating(false)
  }

  if (loading) return <div className="text-slate-500">読み込み中...</div>
  if (!order) return <div className="text-red-500">受注が見つかりません</div>

  const totalAmount = order.items.reduce((s, i) => s + (Number(i.amount) || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500 mb-1">
          <Link href={`/projects/${params.id}`} className="hover:underline">案件</Link> / 受注詳細
        </p>
        <h2 className="text-2xl font-bold text-slate-800">
          {order.order_number || '受注詳細'}
        </h2>
        <div className="flex gap-4 mt-1 text-sm text-slate-500">
          {order.order_date && <span>受注日: {order.order_date}</span>}
          {order.customer_order_number && <span>客先発注No: {order.customer_order_number}</span>}
        </div>
      </div>

      {/* 受注明細 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-slate-700">受注明細</h3>
          <button
            onClick={() => window.open(`/print/order/${order.id}`, '_blank')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg text-xs font-medium"
          >
            受注書を印刷・PDF出力
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b">
              <tr>
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
              {order.items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-800">{item.name}</td>
                  <td className="px-3 py-2 font-mono text-slate-600">{item.model || '-'}</td>
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
                <td colSpan={5} className="px-3 py-2 text-right font-medium text-slate-700">合計</td>
                <td className="px-3 py-2 text-right font-bold text-slate-800">¥{totalAmount.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 発注書 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700">発注書（仕入先別）</h3>
          <div className="flex items-center gap-3">
            <input type="date" value={poDate} onChange={e => setPoDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={handleGeneratePOs} disabled={generating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-1.5 rounded-lg text-sm font-medium">
              {generating ? '生成中...' : '発注書を自動生成'}
            </button>
          </div>
        </div>

        {order.purchase_orders.length === 0 ? (
          <p className="text-slate-400 text-sm">「発注書を自動生成」を押すと仕入先別に発注書が作成されます</p>
        ) : (
          <div className="space-y-3">
            {order.purchase_orders.map(po => (
              <div key={po.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-slate-800">{po.supplier_name}</span>
                    {po.po_date && <span className="text-slate-500 text-sm ml-3">発注日: {po.po_date}</span>}
                    <span className="text-slate-500 text-sm ml-3">{po.items?.length || 0}品目</span>
                  </div>
                  <button
                    onClick={() => window.open(`/print/purchase-order/${po.id}`, '_blank')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg text-xs font-medium"
                  >
                    発注書を印刷・PDF出力
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
