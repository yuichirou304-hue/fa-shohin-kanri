import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient()
  const { id } = await params

  const [projectRes, versionsRes, ordersRes] = await Promise.all([
    supabase.from('projects').select('*, customer:customers(id, company_name)').eq('id', id).single(),
    supabase.from('quote_versions').select('*').eq('project_id', id).order('version_number'),
    supabase.from('orders').select('*').eq('project_id', id).order('created_at', { ascending: false }),
  ])

  if (projectRes.error) return NextResponse.json({ error: projectRes.error.message }, { status: 404 })

  return NextResponse.json({
    ...projectRes.data,
    versions: versionsRes.data || [],
    orders: ordersRes.data || [],
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient()
  const { id } = await params
  const body = await request.json()

  const { data, error } = await supabase
    .from('projects')
    .update({
      quote_number: body.quote_number,
      customer_id: body.customer_id || null,
      customer_name: body.customer_name || null,
      project_name: body.project_name,
      quote_date: body.quote_date || null,
      status: body.status,
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
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
