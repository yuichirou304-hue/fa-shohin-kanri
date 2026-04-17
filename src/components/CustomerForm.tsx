'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomerFormData } from '@/lib/types'

interface Props {
  initialData?: Partial<CustomerFormData>
  customerId?: string
}

const emptyForm: CustomerFormData = {
  code: '',
  company_name: '',
  department: '',
  contact_name: '',
  postal_code: '',
  address: '',
  phone: '',
  fax: '',
  email: '',
  payment_terms: '',
  credit_limit: '',
  notes: '',
  is_active: true,
}

export default function CustomerForm({ initialData, customerId }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<CustomerFormData>({ ...emptyForm, ...initialData })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.company_name.trim()) {
      setError('会社名は必須です')
      return
    }
    setSaving(true)
    setError('')

    const url = customerId ? `/api/customers/${customerId}` : '/api/customers'
    const method = customerId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || '保存に失敗しました')
      setSaving(false)
      return
    }

    router.push('/customers')
    router.refresh()
  }

  const fieldClass = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'
  const labelClass = 'block text-xs font-medium text-slate-600 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* 基本情報 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-4">基本情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>顧客コード</label>
            <input type="text" name="code" value={form.code} onChange={handleChange} className={fieldClass} placeholder="例: C-0001" />
          </div>
          <div>
            <label className={labelClass}>会社名 <span className="text-red-500">*</span></label>
            <input type="text" name="company_name" value={form.company_name} onChange={handleChange} className={fieldClass} required />
          </div>
          <div>
            <label className={labelClass}>部署名</label>
            <input type="text" name="department" value={form.department} onChange={handleChange} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>担当者名</label>
            <input type="text" name="contact_name" value={form.contact_name} onChange={handleChange} className={fieldClass} />
          </div>
        </div>
      </div>

      {/* 連絡先 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-4">連絡先</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>郵便番号</label>
            <input type="text" name="postal_code" value={form.postal_code} onChange={handleChange} className={fieldClass} placeholder="例: 123-4567" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>住所</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>電話番号</label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>FAX</label>
            <input type="text" name="fax" value={form.fax} onChange={handleChange} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>メールアドレス</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className={fieldClass} />
          </div>
        </div>
      </div>

      {/* 取引条件 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-4">取引条件</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>支払条件</label>
            <input type="text" name="payment_terms" value={form.payment_terms} onChange={handleChange} className={fieldClass} placeholder="例: 月末締め翌月末払い" />
          </div>
          <div>
            <label className={labelClass}>与信限度額（円）</label>
            <input type="number" name="credit_limit" value={form.credit_limit} onChange={handleChange} className={fieldClass} min="0" step="1" />
          </div>
        </div>
      </div>

      {/* その他 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-4">その他</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>備考</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className={fieldClass} />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="rounded" />
              有効（チェックを外すと取引停止扱い）
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
          {saving ? '保存中...' : customerId ? '更新する' : '登録する'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="bg-white hover:bg-gray-50 text-slate-700 border border-gray-300 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
          キャンセル
        </button>
      </div>
    </form>
  )
}
