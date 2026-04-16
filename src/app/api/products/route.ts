import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)

  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('category_id') || ''
  const manufacturerId = searchParams.get('manufacturer_id') || ''
  const discontinued = searchParams.get('discontinued') || ''

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      manufacturer:manufacturers(id, name)
    `)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,code.ilike.%${search}%,manufacturer_part_number.ilike.%${search}%`
    )
  }
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }
  if (manufacturerId) {
    query = query.eq('manufacturer_id', manufacturerId)
  }
  if (discontinued === 'true') {
    query = query.eq('is_discontinued', true)
  } else if (discontinued === 'false') {
    query = query.eq('is_discontinued', false)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('products')
    .insert([{
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
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
