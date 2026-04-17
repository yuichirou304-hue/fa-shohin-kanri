'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import SupplierForm from '@/components/SupplierForm'
import { Supplier } from '@/lib/types'

export default function EditSupplierPage() {
  const params = useParams()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/suppliers/${params.id}`)
      .then(r => r.json())
      .then(data => { setSupplier(data); setLoading(false) })
  }, [params.id])

  if (loading) return <div className="text-slate-500">読み込み中...</div>
  if (!supplier) return <div className="text-red-500">仕入先が見つかりません</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">仕入先 編集</h2>
      <SupplierForm
        supplierId={supplier.id}
        initialData={{
          code: supplier.code || '',
          company_name: supplier.company_name,
          department: supplier.department || '',
          contact_name: supplier.contact_name || '',
          postal_code: supplier.postal_code || '',
          address: supplier.address || '',
          phone: supplier.phone || '',
          fax: supplier.fax || '',
          email: supplier.email || '',
          payment_terms: supplier.payment_terms || '',
          notes: supplier.notes || '',
          is_active: supplier.is_active,
        }}
      />
    </div>
  )
}
