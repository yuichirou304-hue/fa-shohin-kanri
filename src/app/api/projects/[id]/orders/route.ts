import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient()
  const { id } = await params
  const body = await request.json()
  // body: { quote_version_id, order_date, customer_order_number, order_number, notes, selected_item_ids: string[] }

  // 受注登録
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      project_id: id,
      quote_version_id: body.quote_version_id,
      order_number: body.order_number || null,
      order_date: body.order_date || null,
      customer_order_number: body.customer_order_number || null,
      notes: body.notes || null,
    }])
    .select()
    .single()

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

  // 選択された見積明細から受注明細を作成
  if (body.selected_item_ids && body.selected_item_ids.length > 0) {
    const { data: quoteItems } = await supabase
      .from('quote_items')
      .select('*')
      .in('id', body.selected_item_ids)
      .order('sort_order')

    if (quoteItems && quoteItems.length > 0) {
      const orderItems = quoteItems.map(item => ({
        order_id: order.id,
        quote_item_id: item.id,
        item_type: item.item_type,
        item_number: item.item_number,
        name: item.name,
        model: item.model,
        manufacturer: item.manufacturer,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        amount: item.amount,
        dp_price: item.dp_price,
        supplier: item.supplier,
        comment1: item.comment1,
        comment2: item.comment2,
        sort_order: item.sort_order,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }
  }

  // 案件ステータスを受注済みに更新
  await supabase.from('projects').update({ status: 'ordered' }).eq('id', id)

  return NextResponse.json(order, { status: 201 })
}
