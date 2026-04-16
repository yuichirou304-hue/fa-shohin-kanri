'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Product, Category, Manufacturer } from '@/lib/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [manufacturerId, setManufacturerId] = useState('')
  const [discontinued, setDiscontinued] = useState('')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categoryId) params.set('category_id', categoryId)
    if (manufacturerId) params.set('manufacturer_id', manufacturerId)
    if (discontinued) params.set('discontinued', discontinued)

    const res = await fetch(`/api/products?${params}`)
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }, [search, categoryId, manufacturerId, discontinued])

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/manufacturers').then(r => r.json()),
    ]).then(([cats, mfrs]) => {
      setCategories(cats)
      setManufacturers(mfrs)
    })
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    fetchProducts()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">商材一覧</h2>
        <Link
          href="/products/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + 新規登録
        </Link>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="商品名・商品コード・型番で検索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-1 md:col-span-2"
          />
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">カテゴリ: すべて</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={manufacturerId}
            onChange={e => setManufacturerId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">メーカー: すべて</option>
            {manufacturers.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={discontinued === 'true'}
              onChange={e => setDiscontinued(e.target.checked ? 'true' : '')}
              className="rounded"
            />
            廃番のみ表示
          </label>
          <button
            onClick={() => { setSearch(''); setCategoryId(''); setManufacturerId(''); setDiscontinued('') }}
            className="text-sm text-blue-600 hover:underline"
          >
            フィルタをクリア
          </button>
        </div>
      </div>

      {/* 件数表示 */}
      <p className="text-sm text-slate-500 mb-3">{loading ? '読み込み中...' : `${products.length} 件`}</p>

      {/* テーブル */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">商品コード</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">商品名</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">メーカー</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">型番</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">カテゴリ</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">仕入単価</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">標準売価</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">在庫数</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">状態</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    商材が登録されていません
                  </td>
                </tr>
              )}
              {products.map(p => (
                <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${p.is_discontinued ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.code || '-'}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.manufacturer?.name || '-'}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{p.manufacturer_part_number || '-'}</td>
                  <td className="px-4 py-3">
                    {p.category ? (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                        {p.category.name}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {p.purchase_price != null ? `¥${p.purchase_price.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">
                    {p.selling_price != null ? `¥${p.selling_price.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{p.stock_quantity}</td>
                  <td className="px-4 py-3 text-center">
                    {p.is_discontinued ? (
                      <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs">廃番</span>
                    ) : (
                      <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs">有効</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Link
                        href={`/products/${p.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        編集
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
