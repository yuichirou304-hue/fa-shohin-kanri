'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface QuoteItem {
  id: string; name: string; model: string; manufacturer: string
  quantity: number; unit: string; unit_price: number; amount: number
  dp_price: number; supplier: string; comment1: string; comment2: string
}
interface QuoteVersion {
  id: string; version_number: number; imported_at: string; notes: string
  items?: QuoteItem[]
}
interface Order {
  id: string; order_number: string; order_date: string; customer_order_number: string; created_at: string
}
interface Project {
  id: string; quote_number: string; project_name: string; customer_name: string
  quote_date: string; status: string; notes: string
  customer?: { company_name: string }
  versions: QuoteVersion[]
  orders: Order[]
}

const STATUS_LABELS: Record<string, string> = {
  quoting: '見積中', ordered: '受注済', completed: '完了', lost: '失注'
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState<QuoteVersion | null>(null)
  const [items, setItems] = useState<QuoteItem[]>([])
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchProject = async () => {
    const res = await fetch(`/api/projects/${params.id}`)
    const data = await res.json()
    setProject(data)
    setLoading(false)
    // 最新バージョンを選択
    if (data.versions && data.versions.length > 0) {
      const latest = data.versions[data.versions.length - 1]
      setSelectedVersion(latest)
      fetchItems(latest.id)
    }
  }

  const fetchItems = async (versionId: string) => {
    const res = await fetch(`/api/projects/${params.id}/versions/${versionId}/items`)
    setItems(await res.json())
  }

  useEffect(() => { fetchProject() }, [params.id])

  const handleCreateVersion = async () => {
    const res = await fetch(`/api/projects/${params.id}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const newVersion = await res.json()
    await fetchProject()
    setSelectedVersion(newVersion)
    setItems([])
  }

  const handleImport = async (versionId: string) => {
    const file = fileRef.current?.files?.[0]
    if (!file) { alert('Excelファイルを選択してください') ; return }
    setImporting(true)
    setImportMsg('')
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`/api/projects/${params.id}/versions/${versionId}/import`, {
      method: 'POST', body: fd,
    })
    const data = await res.json()
    if (res.ok) {
      setImportMsg(`${data.count}件を取込みました`)
      fetchItems(versionId)
    } else {
      setImportMsg(`エラー: ${data.error}`)
    }
    setImporting(false)
  }

  if (loading) return <div className="text-slate-500">読み込み中...</div>
  if (!project) return <div className="text-red-500">案件が見つかりません</div>

  const customerName = project.customer?.company_name || project.customer_name || '-'

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">
            <Link href="/projects" className="hover:underline">案件管理</Link> /
          </p>
          <h2 className="text-2xl font-bold text-slate-800">{project.project_name}</h2>
          <p className="text-slate-500 text-sm mt-1">{project.quote_number} ｜ {customerName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          project.status === 'ordered' ? 'bg-blue-100 text-blue-700' :
          project.status === 'completed' ? 'bg-green-100 text-green-700' :
          project.status === 'lost' ? 'bg-red-100 text-red-600' :
          'bg-yellow-100 text-yellow-700'
        }`}>{STATUS_LABELS[project.status] || project.status}</span>
      </div>

      {/* 見積バージョン */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700">見積バージョン</h3>
          <button onClick={handleCreateVersion}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
            + 新バージョン追加
          </button>
        </div>

        {project.versions.length === 0 ? (
          <p className="text-slate-400 text-sm">バージョンがありません。「新バージョン追加」を押してExcelを取り込んでください。</p>
        ) : (
          <div className="flex gap-2 flex-wrap mb-4">
            {project.versions.map(v => (
              <button
                key={v.id}
                onClick={() => { setSelectedVersion(v); fetchItems(v.id) }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  selectedVersion?.id === v.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-gray-300 hover:bg-slate-50'
                }`}
              >
                Ver.{v.version_number}
                <span className="text-xs ml-2 opacity-70">{v.imported_at?.slice(0, 10)}</span>
              </button>
            ))}
          </div>
        )}

        {selectedVersion && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm text-slate-600">Ver.{selectedVersion.version_number} にExcelを取込む：</span>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" className="text-xs text-slate-600" />
              <button
                onClick={() => handleImport(selectedVersion.id)}
                disabled={importing}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-1.5 rounded-lg text-xs font-medium"
              >
                {importing ? '取込中...' : '機器試算シートを取込'}
              </button>
              {importMsg && <span className="text-sm text-green-600">{importMsg}</span>}
            </div>
          </div>
        )}
      </div>

      {/* 見積明細 */}
      {selectedVersion && items.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="font-semibold text-slate-700">見積明細（Ver.{selectedVersion.version_number}）</h3>
            <span className="text-sm text-slate-500">{items.length}件</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">品名</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">形式</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">メーカー</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">数量</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">御見積単価</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">御見積金額</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">DP単価</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">仕入先</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-800">{item.name}</td>
                    <td className="px-3 py-2 text-slate-600 font-mono">{item.model || '-'}</td>
                    <td className="px-3 py-2 text-slate-600">{item.manufacturer || '-'}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">{item.unit_price ? `¥${Number(item.unit_price).toLocaleString()}` : '-'}</td>
                    <td className="px-3 py-2 text-right font-medium">{item.amount ? `¥${Number(item.amount).toLocaleString()}` : '-'}</td>
                    <td className="px-3 py-2 text-right">{item.dp_price ? `¥${Number(item.dp_price).toLocaleString()}` : '-'}</td>
                    <td className="px-3 py-2 text-slate-500">{item.supplier || '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2">
                <tr>
                  <td colSpan={5} className="px-3 py-2 text-right font-medium text-slate-700">御見積合計</td>
                  <td className="px-3 py-2 text-right font-bold text-slate-800">
                    ¥{items.reduce((s, i) => s + (Number(i.amount) || 0), 0).toLocaleString()}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 受注登録ボタン */}
          {project.orders.length === 0 && (
            <div className="px-6 py-4 border-t">
              <Link
                href={`/projects/${project.id}/orders/new?versionId=${selectedVersion.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors inline-block"
              >
                この見積で受注登録する
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 受注一覧 */}
      {project.orders.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-slate-700 mb-4">受注・発注管理</h3>
          <div className="space-y-2">
            {project.orders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="font-medium text-slate-800">{order.order_number || '（受注番号未設定）'}</span>
                  <span className="text-slate-500 text-sm ml-3">受注日: {order.order_date || '-'}</span>
                  {order.customer_order_number && (
                    <span className="text-slate-500 text-sm ml-3">客先発注No: {order.customer_order_number}</span>
                  )}
                </div>
                <Link href={`/projects/${project.id}/orders/${order.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  詳細・帳票出力 →
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href={`/projects/${project.id}/orders/new?versionId=${project.versions[project.versions.length - 1]?.id}`}
              className="text-blue-600 hover:underline text-sm"
            >
              + 追加受注登録
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
