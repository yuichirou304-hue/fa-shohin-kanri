import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const supabase = createServerClient()
  const { orderId } = await params

  const [orderRes, itemsRes] = await Promise.all([
    supabase
      .from('orders')
      .select('*, project:projects(*, customer:customers(id, company_name))')
      .eq('id', orderId)
      .single(),
    supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('sort_order'),
  ])

  if (orderRes.error) return NextResponse.json({ error: orderRes.error.message }, { status: 404 })

  return NextResponse.json({ ...orderRes.data, items: itemsRes.data || [] })
}
