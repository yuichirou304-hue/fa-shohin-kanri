'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface POItem {
  id: string; name: string; model: string; manufacturer: string
  quantity: number; unit: string; unit_price: number; amount: number
}
interface PurchaseOrder {
  id: string; supplier_name: string; po_number: string; po_date: string; notes: string
  items: POItem[]
  order: {
    order_number: string; order_date: string; customer_order_number: string
    project: { project_name: string; quote_number: string; customer_name: string; customer?: { company_name: string } }
  }
}

export default function PrintPurchaseOrderPage() {
  const params = useParams()
  const [po, setPo] = useState<PurchaseOrder | null>(null)

  useEffect(() => {
    fetch(`/api/purchase-orders/${params.poId}`)
      .then(r => r.json())
      .then(setPo)
  }, [params.poId])

  if (!po) return <div style={{ padding: 40 }}>読み込み中...</div>

  const totalAmount = po.items.reduce((s, i) => s + (Number(i.amount) || 0), 0)
  const customerName = po.order?.project?.customer?.company_name || po.order?.project?.customer_name || ''

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          @page { margin: 15mm; size: A4; }
        }
        body { font-family: 'MS Gothic', 'Meiryo', sans-serif; font-size: 11px; color: #000; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #999; padding: 4px 6px; }
        th { background: #f0f0f0; text-align: center; font-weight: bold; }
      `}</style>

      <div className="no-print" style={{ padding: '16px', background: '#f1f5f9', borderBottom: '1px solid #ccc' }}>
        <button
          onClick={() => window.print()}
          style={{ background: '#2563eb', color: '#fff', padding: '8px 20px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
        >
          印刷 / PDF保存
        </button>
        <button
          onClick={() => window.close()}
          style={{ marginLeft: 12, background: '#fff', padding: '8px 16px', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
        >
          閉じる
        </button>
      </div>

      <div style={{ padding: '20px 30px', maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', fontSize: 20, marginBottom: 24, letterSpacing: 8 }}>発　注　書</h1>

        <table style={{ marginBottom: 16, borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ border: 'none', width: '50%', verticalAlign: 'top' }}>
                <div style={{ borderBottom: '2px solid #000', paddingBottom: 4, marginBottom: 8, fontSize: 14 }}>
                  {po.supplier_name} 御中
                </div>
                <div style={{ fontSize: 11, color: '#555' }}>
                  納入場所：{customerName} {po.order?.project?.project_name}
                </div>
              </td>
              <td style={{ border: 'none', width: '50%', verticalAlign: 'top', paddingLeft: 20 }}>
                <table style={{ borderCollapse: 'collapse', fontSize: 11 }}>
                  <tbody>
                    <tr>
                      <td style={{ border: 'none', paddingRight: 8 }}>発注番号</td>
                      <td style={{ border: 'none' }}>{po.po_number || '-'}</td>
                    </tr>
                    <tr>
                      <td style={{ border: 'none', paddingRight: 8 }}>発注日</td>
                      <td style={{ border: 'none' }}>{po.po_date || '-'}</td>
                    </tr>
                    <tr>
                      <td style={{ border: 'none', paddingRight: 8 }}>見積番号</td>
                      <td style={{ border: 'none' }}>{po.order?.project?.quote_number || '-'}</td>
                    </tr>
                    <tr>
                      <td style={{ border: 'none', paddingRight: 8 }}>受注番号</td>
                      <td style={{ border: 'none' }}>{po.order?.order_number || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginBottom: 12, fontSize: 12 }}>
          件名：{po.order?.project?.project_name || ''}
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: 30 }}>No</th>
              <th>品名</th>
              <th>形式</th>
              <th>メーカー</th>
              <th style={{ width: 50 }}>数量</th>
              <th style={{ width: 50 }}>単位</th>
              <th style={{ width: 90 }}>単価（DP）</th>
              <th style={{ width: 100 }}>金額</th>
            </tr>
          </thead>
          <tbody>
            {po.items.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                <td>{item.name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 10 }}>{item.model || ''}</td>
                <td>{item.manufacturer || ''}</td>
                <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ textAlign: 'center' }}>{item.unit || '台'}</td>
                <td style={{ textAlign: 'right' }}>{item.unit_price ? `¥${Number(item.unit_price).toLocaleString()}` : ''}</td>
                <td style={{ textAlign: 'right' }}>{item.amount ? `¥${Number(item.amount).toLocaleString()}` : ''}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 15 - po.items.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={7} style={{ textAlign: 'right', fontWeight: 'bold' }}>合計（税抜）</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>¥{totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        {po.notes && (
          <div style={{ marginTop: 12, fontSize: 11 }}>
            <strong>備考：</strong>{po.notes}
          </div>
        )}
      </div>
    </>
  )
}
