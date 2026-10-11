import { useState } from 'react'
import { getProductStatus } from '../utils/kpi'
import { Search, Megaphone, Download, Trash2, ScanText } from 'lucide-react'

const calcMargin = (p) => p.hpp ? (((p.hargaJual - p.hpp) / p.hargaJual) * 100).toFixed(1) : '-'

function exportCSV(data) {
  const headers = ['Nama Produk', 'Kategori', 'Stok', 'Stok Min', 'Harga Jual', 'HPP', 'Margin (%)', 'Expired', 'Status']
  const rows = data.map(p => [
    p.nama, p.kategori, p.stok, p.stokMin ?? '-',
    p.hargaJual, p.hpp ?? '-', calcMargin(p), p.expired ?? '-', getProductStatus(p)
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `inventaris-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const formatRupiah = (v) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)

const STATUS_CONFIG = {
  'normal':         { label: 'Normal',         bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'low-stock':      { label: 'Low-Stock',       bg: 'bg-yellow-100',  text: 'text-yellow-700'  },
  'dead-stock':     { label: 'Dead-Stock',      bg: 'bg-amber-100',   text: 'text-amber-700'   },
  'hampir-expired': { label: 'Hampir Expired',  bg: 'bg-orange-100',  text: 'text-orange-700'  },
  'expired':        { label: 'Expired',         bg: 'bg-red-100',     text: 'text-red-700'     },
}

function StatusBadge({ status }) {
  const { label, bg, text } = STATUS_CONFIG[status] || STATUS_CONFIG.normal
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
      {label}
    </span>
  )
}

export default function ActionTable({ items = [], categories = ['Semua'], onCreatePromo, onDelete, onDeleteMany, onOpenOcr }) {
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('Semua')
  const [selected, setSelected]   = useState(new Set())
  const [confirmId, setConfirmId] = useState(null)   // id produk yang mau dihapus satu
  const [confirmMany, setConfirmMany] = useState(false) // konfirmasi hapus banyak

  const filtered = items.filter(p => {
    const matchSearch   = p.nama.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'Semua' || p.kategori === category
    return matchSearch && matchCategory
  })

  const allChecked  = filtered.length > 0 && filtered.every(p => selected.has(p.id))
  const someChecked = filtered.some(p => selected.has(p.id))

  function toggleAll() {
    if (allChecked) {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(p => s.delete(p.id)); return s })
    } else {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(p => s.add(p.id)); return s })
    }
  }

  function toggleOne(id) {
    setSelected(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s })
  }

  function handleDeleteOne(id) {
    onDelete?.(id)
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s })
    setConfirmId(null)
  }

  function handleDeleteMany() {
    onDeleteMany?.([...selected])
    setSelected(new Set())
    setConfirmMany(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-700">Inventaris Produk</h3>
          {someChecked && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {selected.size} dipilih
            </span>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          {/* Hapus terpilih */}
          {someChecked && (
            <button
              onClick={() => setConfirmMany(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Trash2 size={13} />
              Hapus ({selected.size})
            </button>
          )}
          {/* Scan Faktur OCR */}
          <button
            onClick={() => onOpenOcr?.()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors flex-shrink-0"
          >
            <ScanText size={13} />
            Scan Faktur (AI OCR)
          </button>
          {/* Export CSV */}
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex-shrink-0"
          >
            <Download size={13} />
            Export CSV
          </button>
          {/* Search */}
          <div className="relative flex-1 sm:w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          {/* Category filter */}
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={el => { if (el) el.indeterminate = someChecked && !allChecked }}
                  onChange={toggleAll}
                  className="rounded border-gray-300 accent-blue-600"
                />
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Produk</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Stok</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Stok Min</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Harga Jual</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">HPP</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Margin</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expired</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(p => {
              const status   = getProductStatus(p)
              const canPromo = status === 'expired' || status === 'dead-stock' || status === 'hampir-expired'
              const isSelected = selected.has(p.id)
              return (
                <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(p.id)}
                      className="rounded border-gray-300 accent-blue-600"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.nama}</td>
                  <td className="px-4 py-3 text-gray-500">{p.kategori}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{p.stok}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-500">{p.stokMin ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{formatRupiah(p.hargaJual)}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-500">{p.hpp ? formatRupiah(p.hpp) : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    {p.hpp
                      ? <span className={`text-xs font-semibold ${((p.hargaJual-p.hpp)/p.hargaJual*100) >= 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {calcMargin(p)}%
                        </span>
                      : <span className="text-gray-400 text-xs">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.expired ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => canPromo && onCreatePromo(p)}
                        disabled={!canPromo}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors
                          ${canPromo
                            ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        <Megaphone size={11} />
                        Promo
                      </button>
                      <button
                        onClick={() => setConfirmId(p.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus produk"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">Tidak ada produk ditemukan.</div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
        Menampilkan {filtered.length} dari {items.length} produk
      </div>

      {/* Dialog konfirmasi hapus satu */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-xl">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Hapus Produk?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Produk <span className="font-semibold text-gray-700">"{items.find(p => p.id === confirmId)?.nama}"</span> akan dihapus secara permanen.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmId(null)} className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Batal</button>
              <button onClick={() => handleDeleteOne(confirmId)} className="flex-1 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog konfirmasi hapus banyak */}
      {confirmMany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-xl">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Hapus {selected.size} Produk?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Semua <span className="font-semibold text-gray-700">{selected.size} produk</span> yang dipilih akan dihapus secara permanen.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmMany(false)} className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Batal</button>
              <button onClick={handleDeleteMany} className="flex-1 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors">Hapus Semua</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
