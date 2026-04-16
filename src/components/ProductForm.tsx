'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProductFormData, Category, Manufacturer } from '@/lib/types'

interface Props {
  initialData?: Partial<ProductFormData>
  productId?: string
}

const emptyForm: ProductFormData = {
  code: '',
  name: '',
  manufacturer_id: '',
  manufacturer_part_number: '',
  category_id: '',
  spec: '',
  purchase_price: '',
  selling_price: '',
  supplier: '',
  stock_quantity: '0',
  reorder_point: '',
  is_discontinued: false,
  notes: '',
}

export default function ProductForm({ initialData, productId }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<ProductFormData>({ ...emptyForm, ...initialData })
  const [categories, setCategories] = useState<Category[]>([])
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/manufacturers').then(r => r.json()),
    ]).then(([cats, mfrs]) => {
      setCategories(cats)
      setManufacturers(mfrs)
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('商品名は必須です')
      return
    }
    setSaving(true)
    setError('')

    const url = productId ? `/api/products/${productId}` : '/api/products'
    const method = productId ? 'PUT' : 'POST'

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

    router.push('/products')
    router.refresh()
  }

  const fieldClass = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'
  const labelClass = 'block text-xs font-medium text-slate-600 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 基本情報 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-4">基本情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>商品コード</label>
            <input type="text" name="code" value={form.code} onChange={handleChange} className={fieldClass} placeholder="例: FA-0001" />
          </div>
          <div>
            <label className={labelClass}>商品名 <span className="text-red-500">*</span></label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className={fieldClass} required />
          </div>
          <div>
            <label className={labelClass}>カテゴリ</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} className={fieldClass}>
              <option value="">未選択</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>仕様・スペック</label>
            <input type="text" name="spec" value={form.spec} onChange={handleChange} className={fieldClass} placeholder="例: DC24V、検出距離300mm" />
          </div>
        </div>
      </div>

      {/* メーカー情報 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-4">メーカー情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>メーカー</label>
            <select name="manufacturer_id" value={form.manufacturer_id} onChange={handleChange} className={fieldClass}>
              <option value="">未選択</option>
              {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>メーカー型番</label>
            <input type="text" name="manufacturer_part_number" value={form.manufacturer_part_number} onChange={handleChange} className={fieldClass} />
          </div>
        </div>
      </div>

      {/* 価格・在庫 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-4">価格・在庫</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>仕入単価（円）</label>
            <input type="number" name="purchase_price" value={form.purchase_price} onChange={handleChange} className={fieldClass} min="0" step="1" />
          </div>
          <div>
            <label className={labelClass}>標準売価（円）</label>
            <input type="number" name="selling_price" value={form.selling_price} onChange={handleChange} className={fieldClass} min="0" step="1" />
          </div>
          <div>
            <label className={labelClass}>仕入先</label>
            <input type="text" name="supplier" value={form.supplier} onChange={handleChange} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>在庫数</label>
            <input type="number" name="stock_quantity" value={form.stock_quantity} onChange={handleChange} className={fieldClass} min="0" step="1" />
          </div>
          <div>
            <label className={labelClass}>発注点</label>
            <input type="number" name="reorder_point" value={form.reorder_point} onChange={handleChange} className={fieldClass} min="0" step="1" />
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
              <input
                type="checkbox"
                name="is_discontinued"
                checked={form.is_discontinued}
                onChange={handleChange}
                className="rounded"
              />
              廃番にする
            </label>
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? '保存中...' : productId ? '更新する' : '登録する'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-white hover:bg-gray-50 text-slate-700 border border-gray-300 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
