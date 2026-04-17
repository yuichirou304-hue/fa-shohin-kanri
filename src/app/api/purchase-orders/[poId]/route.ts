import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ poId: string }> }
) {
  const supabase = createServerClient()
  const { poId } = await params

  const [poRes, itemsRes] = await Promise.all([
    supabase.from('purchase_orders').select('*, order:orders(*, project:projects(*))').eq('id', poId).single(),
    supabase.from('purchase_order_items').select('*').eq('purchase_order_id', poId).order('sort_order'),
  ])

  if (poRes.error) return NextResponse.json({ error: poRes.error.message }, { status: 404 })

  return NextResponse.json({ ...poRes.data, items: itemsRes.data || [] })
}
