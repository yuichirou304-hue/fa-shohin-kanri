import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      manufacturer:manufacturers(id, name)
    `)
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient()
  const { id } = await params
  const body = await request.json()

  const { data, error } = await supabase
    .from('products')
    .update({
      code: body.code || null,
      name: body.name,
      manufacturer_id: body.manufacturer_id || null,
      manufacturer_part_number: body.manufacturer_part_number || null,
      category_id: body.category_id || null,
      spec: body.spec || null,
      purchase_price: body.purchase_price ? Number(body.purchase_price) : null,
      selling_price: body.selling_price ? Number(body.selling_price) : null,
      supplier: body.supplier || null,
      stock_quantity: Number(body.stock_quantity) || 0,
      reorder_point: body.reorder_point ? Number(body.reorder_point) : null,
      is_discontinued: body.is_discontinued || false,
      notes: body.notes || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient()
  const { id } = await params

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
