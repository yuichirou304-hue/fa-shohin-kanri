import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const { rows, mapping } = await request.json()

  // mapping: { code, name, manufacturer_name, manufacturer_part_number, category_name, spec, purchase_price, selling_price, supplier, stock_quantity, notes }
  const results = { success: 0, skipped: 0, errors: [] as string[] }

  for (const row of rows) {
    try {
      const name = row[mapping.name]?.trim()
      if (!name) {
        results.skipped++
        continue
      }

      // メーカーの取得または作成
      let manufacturerId: string | null = null
      const manufacturerName = row[mapping.manufacturer_name]?.trim()
      if (manufacturerName) {
        const { data: existingMfr } = await supabase
          .from('manufacturers')
          .select('id')
          .eq('name', manufacturerName)
          .single()

        if (existingMfr) {
          manufacturerId = existingMfr.id
        } else {
          const { data: newMfr } = await supabase
            .from('manufacturers')
            .insert([{ name: manufacturerName }])
            .select('id')
            .single()
          if (newMfr) manufacturerId = newMfr.id
        }
      }

      // カテゴリの取得または作成
      let categoryId: string | null = null
      const categoryName = row[mapping.category_name]?.trim()
      if (categoryName) {
        const { data: existingCat } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .single()

        if (existingCat) {
          categoryId = existingCat.id
        } else {
          const { data: newCat } = await supabase
            .from('categories')
            .insert([{ name: categoryName }])
            .select('id')
            .single()
          if (newCat) categoryId = newCat.id
        }
      }

      const productData = {
        code: row[mapping.code]?.trim() || null,
        name,
        manufacturer_id: manufacturerId,
        manufacturer_part_number: row[mapping.manufacturer_part_number]?.trim() || null,
        category_id: categoryId,
        spec: row[mapping.spec]?.trim() || null,
        purchase_price: row[mapping.purchase_price] ? Number(String(row[mapping.purchase_price]).replace(/[^0-9.]/g, '')) : null,
        selling_price: row[mapping.selling_price] ? Number(String(row[mapping.selling_price]).replace(/[^0-9.]/g, '')) : null,
        supplier: row[mapping.supplier]?.trim() || null,
        stock_quantity: row[mapping.stock_quantity] ? Number(String(row[mapping.stock_quantity]).replace(/[^0-9]/g, '')) : 0,
        notes: row[mapping.notes]?.trim() || null,
      }

      const { error } = await supabase.from('products').upsert([productData], {
        onConflict: 'code',
        ignoreDuplicates: false,
      })

      if (error) {
        results.errors.push(`行「${name}」: ${error.message}`)
      } else {
        results.success++
      }
    } catch (e) {
      results.errors.push(`予期せぬエラー: ${e}`)
    }
  }

  return NextResponse.json(results)
}
