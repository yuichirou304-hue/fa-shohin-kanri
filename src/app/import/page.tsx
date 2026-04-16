'use client'

import { useState, useRef } from 'react'

const FIELD_OPTIONS = [
  { value: '', label: '（インポートしない）' },
  { value: 'code', label: '商品コード' },
  { value: 'name', label: '商品名 *' },
  { value: 'manufacturer_name', label: 'メーカー名' },
  { value: 'manufacturer_part_number', label: 'メーカー型番' },
  { value: 'category_name', label: 'カテゴリ名' },
  { value: 'spec', label: '仕様・スペック' },
  { value: 'purchase_price', label: '仕入単価' },
  { value: 'selling_price', label: '標準売価' },
  { value: 'supplier', label: '仕入先' },
  { value: 'stock_quantity', label: '在庫数' },
  { value: 'notes', label: '備考' },
]

export default function ImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ success: number; skipped: number; errors: string[] } | null>(null)
  const [importing, setImporting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      // Shift-JIS対応のため、TextDecoderでの読み込みを試みる
      const lines = text.split(/\r?\n/).filter(l => l.trim())
      if (lines.length < 2) return

      const parseCSVLine = (line: string) => {
        const result: string[] = []
        let current = ''
        let inQuote = false
        for (let i = 0; i < line.length; i++) {
          const ch = line[i]
          if (ch === '"') {
            inQuote = !inQuote
          } else if (ch === ',' && !inQuote) {
            result.push(current)
            current = ''
          } else {
            current += ch
          }
        }
        result.push(current)
        return result
      }

      const hdrs = parseCSVLine(lines[0])
      setHeaders(hdrs)

      // 自動マッピング（PCA商魂の一般的な列名）
      const autoMap: Record<string, string> = {}
      hdrs.forEach(h => {
        const normalized = h.trim()
        if (/商品コード|品番/.test(normalized)) autoMap[h] = 'code'
        else if (/商品名|品名/.test(normalized)) autoMap[h] = 'name'
        else if (/メーカー|製造元/.test(normalized)) autoMap[h] = 'manufacturer_name'
        else if (/型番|メーカー品番|型式/.test(normalized)) autoMap[h] = 'manufacturer_part_number'
        else if (/カテゴリ|分類|種別/.test(normalized)) autoMap[h] = 'category_name'
        else if (/仕様|規格|スペック/.test(normalized)) autoMap[h] = 'spec'
        else if (/仕入.*単価|仕入価格/.test(normalized)) autoMap[h] = 'purchase_price'
        else if (/売価|販売価格|標準売価/.test(normalized)) autoMap[h] = 'selling_price'
        else if (/仕入先|仕入元/.test(normalized)) autoMap[h] = 'supplier'
        else if (/在庫/.test(normalized)) autoMap[h] = 'stock_quantity'
        else if (/備考|メモ/.test(normalized)) autoMap[h] = 'notes'
        else autoMap[h] = ''
      })
      setMapping(autoMap)

      const dataRows = lines.slice(1).map(line => {
        const vals = parseCSVLine(line)
        const row: Record<string, string> = {}
        hdrs.forEach((h, i) => { row[h] = vals[i] || '' })
        return row
      })
      setRows(dataRows)
      setResult(null)
    }
    reader.readAsText(file, 'Shift-JIS')
  }

  const handleMappingChange = (header: string, value: string) => {
    setMapping(prev => ({ ...prev, [header]: value }))
  }

  const handleImport = async () => {
    const nameColumn = Object.entries(mapping).find(([, v]) => v === 'name')?.[0]
    if (!nameColumn) {
      alert('「商品名」に対応する列を選択してください')
      return
    }

    setImporting(true)
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, mapping }),
    })
    const data = await res.json()
    setResult(data)
    setImporting(false)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">CSVインポート</h2>
      <p className="text-slate-500 text-sm mb-6">PCA商魂からエクスポートしたCSVファイルを取り込めます</p>

      {/* ファイル選択 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-slate-700 mb-4">ファイルを選択</h3>
        <div className="flex items-center gap-4">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">CSV形式（Shift-JIS / UTF-8対応）</p>
      </div>

      {/* カラムマッピング */}
      {headers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-slate-700 mb-1">列の対応付け</h3>
          <p className="text-xs text-slate-400 mb-4">CSVの列がどの項目に対応するか確認・修正してください</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {headers.map(h => (
              <div key={h} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-40 truncate" title={h}>{h}</span>
                <span className="text-slate-400">→</span>
                <select
                  value={mapping[h] || ''}
                  onChange={e => handleMappingChange(h, e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                >
                  {FIELD_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* プレビュー */}
          {rows.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2">プレビュー（先頭3件）</p>
              <div className="overflow-x-auto">
                <table className="text-xs border-collapse">
                  <thead>
                    <tr>
                      {headers.map(h => (
                        <th key={h} className="border border-gray-200 px-2 py-1 bg-slate-50 text-slate-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 3).map((row, i) => (
                      <tr key={i}>
                        {headers.map(h => (
                          <td key={h} className="border border-gray-200 px-2 py-1 text-slate-600">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mt-1">全{rows.length}件</p>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleImport}
              disabled={importing}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {importing ? 'インポート中...' : `${rows.length}件をインポート`}
            </button>
          </div>
        </div>
      )}

      {/* 結果 */}
      {result && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-slate-700 mb-4">インポート結果</h3>
          <div className="flex gap-6 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{result.success}</p>
              <p className="text-sm text-slate-500">成功</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-500">{result.skipped}</p>
              <p className="text-sm text-slate-500">スキップ</p>
            </div>
            {result.errors.length > 0 && (
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">{result.errors.length}</p>
                <p className="text-sm text-slate-500">エラー</p>
              </div>
            )}
          </div>
          {result.errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-sm font-medium text-red-700 mb-2">エラー詳細</p>
              <ul className="text-xs text-red-600 space-y-1">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
