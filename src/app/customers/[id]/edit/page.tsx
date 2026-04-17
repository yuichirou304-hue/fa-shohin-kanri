'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import CustomerForm from '@/components/CustomerForm'
import { Customer } from '@/lib/types'

export default function EditCustomerPage() {
  const params = useParams()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/customers/${params.id}`)
      .then(r => r.json())
      .then(data => { setCustomer(data); setLoading(false) })
  }, [params.id])

  if (loading) return <div className="text-slate-500">読み込み中...</div>
  if (!customer) return <div className="text-red-500">顧客が見つかりません</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">顧客 編集</h2>
      <CustomerForm
        customerId={customer.id}
        initialData={{
          code: customer.code || '',
          company_name: customer.company_name,
          department: customer.department || '',
          contact_name: customer.contact_name || '',
          postal_code: customer.postal_code || '',
          address: customer.address || '',
          phone: customer.phone || '',
          fax: customer.fax || '',
          email: customer.email || '',
          payment_terms: customer.payment_terms || '',
          credit_limit: customer.credit_limit != null ? String(customer.credit_limit) : '',
          notes: customer.notes || '',
          is_active: customer.is_active,
        }}
      />
    </div>
  )
}
