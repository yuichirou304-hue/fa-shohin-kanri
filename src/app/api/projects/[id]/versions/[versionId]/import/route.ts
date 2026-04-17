import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import ExcelJS from 'exceljs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const supabase = createServerClient()
  const { versionId } = await params

  const formData = await request.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'ファイルがありません' }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const workbook = new ExcelJS.Workbook()
  const buffer = Buffer.from(new Uint8Array(arrayBuffer))
  await workbook.xlsx.load(buffer)

  // 機器試算シートを探す（「(」を含まない方を優先）
  let sheet = workbook.getWorksheet('機器試算')
  if (!sheet) {
    sheet = workbook.worksheets.find(ws => ws.name.includes('機器試算') && !ws.name.includes('('))
      ?? workbook.worksheets.find(ws => ws.name.includes('機器試算'))
      ?? workbook.worksheets[0]
  }

  if (!sheet) return NextResponse.json({ error: 'シートが見つかりません' }, { status: 400 })

  // ヘッダー行を探す（品名が含まれる行）
  let headerRowNum = -1
  sheet.eachRow((row, rowNumber) => {
    if (headerRowNum !== -1) return
    if (rowNumber > 10) return
    const values = row.values as (string | number | null)[]
    if (values.some(v => v && String(v).includes('品') && String(v).includes('名'))) {
      headerRowNum = rowNumber
    }
  })
  if (headerRowNum === -1) headerRowNum = 3

  // 既存明細を削除
  await supabase.from('quote_items').delete().eq('quote_version_id', versionId)

  const items: object[] = []
  let sortOrder = 0

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowNum) return
    const vals = row.values as (string | number | ExcelJS.CellValue | null)[]

    const name = String(vals[1] ?? '').trim()
    if (!name || name.includes('合計') || name.includes('小計')) return

    const toNum = (v: unknown) => {
      const n = parseFloat(String(v ?? '').replace(/[^0-9.]/g, ''))
      return isNaN(n) ? null : n
    }

    items.push({
      quote_version_id: versionId,
      item_type: 'equipment',
      name,
      model: String(vals[2] ?? '').trim() || null,
      manufacturer: String(vals[3] ?? '').trim() || null,
      quantity: toNum(vals[4]) ?? 1,
      unit: '台',
      unit_price: toNum(vals[5]),
      amount: toNum(vals[6]),
      dp_price: toNum(vals[7]),
      dp_amount: toNum(vals[8]),
      supplier: String(vals[11] ?? '').trim() || null,
      comment1: String(vals[13] ?? '').trim() || null,
      comment2: String(vals[14] ?? '').trim() || null,
      sort_order: sortOrder++,
    })
  })

  if (items.length === 0) {
    return NextResponse.json({ error: 'データが見つかりませんでした' }, { status: 400 })
  }

  const { error } = await supabase.from('quote_items').insert(items)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, count: items.length })
}
