import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  let query = supabase
    .from('suppliers')
    .select('*')
    .order('company_name')

  if (search) {
    query = query.or(
      `company_name.ilike.%${search}%,code.ilike.%${search}%,contact_name.ilike.%${search}%`
    )
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('suppliers')
    .insert([{
      code: body.code || null,
      company_name: body.company_name,
      department: body.department || null,
      contact_name: body.contact_name || null,
      postal_code: body.postal_code || null,
      address: body.address || null,
      phone: body.phone || null,
      fax: body.fax || null,
      email: body.email || null,
      payment_terms: body.payment_terms || null,
      notes: body.notes || null,
      is_active: body.is_active ?? true,
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
