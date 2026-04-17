import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient()
  const { id } = await params
  const body = await request.json()

  // 最新バージョン番号を取得
  const { data: existing } = await supabase
    .from('quote_versions')
    .select('version_number')
    .eq('project_id', id)
    .order('version_number', { ascending: false })
    .limit(1)

  const nextVersion = existing && existing.length > 0 ? existing[0].version_number + 1 : 1

  const { data, error } = await supabase
    .from('quote_versions')
    .insert([{
      project_id: id,
      version_number: nextVersion,
      notes: body.notes || null,
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
