import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; orderId: string }> }
) {
  const supabase = createServerClient()
  const { id, orderId } = await params

  const [orderRes, itemsRes, posRes] = await Promise.all([
    supabase.from('orders').select('*').eq('id', orderId).eq('project_id', id).single(),
    supabase.from('order_items').select('*').eq('order_id', orderId).order('sort_order'),
    supabase.from('purchase_orders').select('*, items:purchase_order_items(*)').eq('order_id', orderId),
  ])

  if (orderRes.error) return NextResponse.json({ error: orderRes.error.message }, { status: 404 })

  return NextResponse.json({
    ...orderRes.data,
    items: itemsRes.data || [],
    purchase_orders: posRes.data || [],
  })
}
