'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ProductForm from '@/components/ProductForm'
import { Product } from '@/lib/types'

export default function EditProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data)
        setLoading(false)
      })
  }, [params.id])

  if (loading) return <div className="text-slate-500">読み込み中...</div>
  if (!product) return <div className="text-red-500">商材が見つかりません</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">商材 編集</h2>
      <ProductForm
        productId={product.id}
        initialData={{
          code: product.code || '',
          name: product.name,
          manufacturer_id: product.manufacturer_id || '',
          manufacturer_part_number: product.manufacturer_part_number || '',
          category_id: product.category_id || '',
          spec: product.spec || '',
          purchase_price: product.purchase_price != null ? String(product.purchase_price) : '',
          selling_price: product.selling_price != null ? String(product.selling_price) : '',
          supplier: product.supplier || '',
          stock_quantity: String(product.stock_quantity),
          reorder_point: product.reorder_point != null ? String(product.reorder_point) : '',
          is_discontinued: product.is_discontinued,
          notes: product.notes || '',
        }}
      />
    </div>
  )
}
