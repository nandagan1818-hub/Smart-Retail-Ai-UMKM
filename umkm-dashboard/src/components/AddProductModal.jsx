import { useState } from 'react'
import { X, Plus, PackagePlus } from 'lucide-react'
import { getSupplierIdForCategory } from '../utils/supplierLookup'

const KATEGORI_OPTIONS = [
  'Minuman', 'Makanan Pokok', 'Bumbu & Saus',
  'Snack & Susu', 'Kebersihan', 'Lainnya'
]

const EMPTY_FORM = {
  nama: '', kategori: 'Minuman', supplierId: '', stok: '',
  hargaJual: '', hpp: '', stokMin: '', expired: ''
}

export default function AddProductModal({ pemasokList, onAdd, onClose }) {
  const [form, setForm]     = useState(() => ({
    ...EMPTY_FORM,
    supplierId: getSupplierIdForCategory('Minuman', pemasokList) ?? '',
  }))
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.nama.trim())                      e.nama      = 'Nama produk wajib diisi'
    if (!form.stok || form.stok <= 0)           e.stok      = 'Stok harus lebih dari 0'
    if (!form.hargaJual || form.hargaJual <= 0) e.hargaJual = 'Harga jual harus lebih dari 0'
    if (!form.hpp || form.hpp <= 0)             e.hpp       = 'HPP (Harga Beli) wajib diisi'
    if (Number(form.hpp) >= Number(form.hargaJual)) e.hpp   = 'HPP harus lebih kecil dari Harga Jual'
    return e
  }

  function handleChange(field, value) {
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'kategori'
        ? { supplierId: getSupplierIdForCategory(value, pemasokList) ?? '' }
        : {}),
    }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }
    onAdd({
      nama:         form.nama.trim(),
      kategori:     form.kategori,
      supplierId:   form.supplierId ? Number(form.supplierId) : null,
      stok:         parseInt(form.stok),
      hargaJual:    parseInt(form.hargaJual),
      hpp:          parseInt(form.hpp),
      stokMin:      form.stokMin ? parseInt(form.stokMin) : 5,
      estimasiLaku: 10,   // default konservatif — bisa diupdate manual
      expired:      form.expired || null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <PackagePlus size={16} className="text-blue-600" />
            </div>
            <h2 className="text-sm font-semibold text-gray-800">Tambah Produk Baru</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Nama Produk */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Produk <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.nama}
              onChange={e => handleChange('nama', e.target.value)}
              placeholder="contoh: Mie Instan Goreng"
              className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.nama ? 'border-red-300' : 'border-gray-200'}`}
            />
            {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama}</p>}
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori <span className="text-red-500">*</span></label>
            <select
              value={form.kategori}
              onChange={e => handleChange('kategori', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {KATEGORI_OPTIONS.map(k => <option key={k}>{k}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Pemasok</label>
            <select
              value={form.supplierId}
              onChange={e => handleChange('supplierId', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Pilih pemasok (opsional)</option>
              {pemasokList.map(pemasok => (
                <option key={pemasok.id} value={pemasok.id}>{pemasok.nama}</option>
              ))}
            </select>
          </div>

          {/* Stok & Stok Minimum */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Stok Saat Ini <span className="text-red-500">*</span></label>
              <input
                type="number" min="0"
                value={form.stok}
                onChange={e => handleChange('stok', e.target.value)}
                placeholder="0"
                className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.stok ? 'border-red-300' : 'border-gray-200'}`}
              />
              {errors.stok && <p className="text-xs text-red-500 mt-1">{errors.stok}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Stok Minimum <span className="text-gray-400 font-normal">(alert reorder)</span></label>
              <input
                type="number" min="0"
                value={form.stokMin}
                onChange={e => handleChange('stokMin', e.target.value)}
                placeholder="5"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Harga Jual & HPP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Harga Jual (Rp) <span className="text-red-500">*</span></label>
              <input
                type="number" min="0"
                value={form.hargaJual}
                onChange={e => handleChange('hargaJual', e.target.value)}
                placeholder="0"
                className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.hargaJual ? 'border-red-300' : 'border-gray-200'}`}
              />
              {errors.hargaJual && <p className="text-xs text-red-500 mt-1">{errors.hargaJual}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">HPP / Harga Beli (Rp) <span className="text-red-500">*</span></label>
              <input
                type="number" min="0"
                value={form.hpp}
                onChange={e => handleChange('hpp', e.target.value)}
                placeholder="0"
                className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.hpp ? 'border-red-300' : 'border-gray-200'}`}
              />
              {errors.hpp && <p className="text-xs text-red-500 mt-1">{errors.hpp}</p>}
            </div>
          </div>
          {form.hargaJual && form.hpp && Number(form.hpp) < Number(form.hargaJual) && (
            <p className="text-xs text-emerald-600 -mt-2">
              ✓ Margin: {(((form.hargaJual - form.hpp) / form.hargaJual) * 100).toFixed(1)}%
            </p>
          )}

          {/* Tanggal Expired */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Expired <span className="text-gray-400 font-normal">(opsional)</span></label>
            <input
              type="date"
              value={form.expired}
              onChange={e => handleChange('expired', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              <Plus size={15} />
              Tambah Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
