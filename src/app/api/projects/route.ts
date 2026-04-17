import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''

  let query = supabase
    .from('projects')
    .select('*, customer:customers(id, company_name)')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`quote_number.ilike.%${search}%,project_name.ilike.%${search}%,customer_name.ilike.%${search}%`)
  }
  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('projects')
    .insert([{
      quote_number: body.quote_number,
      customer_id: body.customer_id || null,
      customer_name: body.customer_name || null,
      project_name: body.project_name,
      quote_date: body.quote_date || null,
      status: body.status || 'quoting',
      notes: body.notes || null,
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
