import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const supabase = createServerClient()
  const { versionId } = await params

  const { data, error } = await supabase
    .from('quote_items')
    .select('*')
    .eq('quote_version_id', versionId)
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const supabase = createServerClient()
  const { versionId } = await params
  const body = await request.json()

  const { data, error } = await supabase
    .from('quote_items')
    .insert([{ ...body, quote_version_id: versionId }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
