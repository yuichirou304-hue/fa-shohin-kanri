import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; orderId: string }> }
) {
  const supabase = createServerClient()
  const { orderId } = await params
  const body = await request.json()
  // body: { po_date, notes }

  // 受注明細を仕入先でグループ化
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('sort_order')

  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })
  if (!orderItems || orderItems.length === 0) {
    return NextResponse.json({ error: '受注明細がありません' }, { status: 400 })
  }

  // 仕入先でグループ化（仕入先が空の場合は「未設定」）
  const groups: Record<string, typeof orderItems> = {}
  for (const item of orderItems) {
    const key = item.supplier || '未設定'
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  }

  // 既存の発注書を削除
  await supabase.from('purchase_orders').delete().eq('order_id', orderId)

  const createdPOs = []

  for (const [supplierName, items] of Object.entries(groups)) {
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert([{
        order_id: orderId,
        supplier_name: supplierName,
        po_number: body.po_number || null,
        po_date: body.po_date || null,
        notes: body.notes || null,
      }])
      .select()
      .single()

    if (poError) continue

    const poItems = items.map(item => ({
      purchase_order_id: po.id,
      order_item_id: item.id,
      name: item.name,
      model: item.model,
      manufacturer: item.manufacturer,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.dp_price,
      amount: item.dp_price ? item.dp_price * item.quantity : null,
      sort_order: item.sort_order,
    }))

    await supabase.from('purchase_order_items').insert(poItems)
    createdPOs.push(po)
  }

  return NextResponse.json({ success: true, purchase_orders: createdPOs })
}
