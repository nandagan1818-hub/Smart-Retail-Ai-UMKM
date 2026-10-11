import { useState, useRef } from 'react'
import axios from 'axios'
import {
  X, ScanText, ImageIcon, Loader2, CheckCircle2,
  AlertTriangle, Plus, Trash2, Edit3, RefreshCw
} from 'lucide-react'

/* ─── OCR via server-side API route ─────────────────── */
async function runOCR(base64Image, mimeType) {
  const res = await axios.post('/api/ocr', { base64Image, mimeType }, { timeout: 65000 })
  return res.data.items
}

/* ─── helpers ────────────────────────────────────────── */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // result is "data:image/jpeg;base64,XXXX" — strip prefix
      const b64 = reader.result.split(',')[1]
      resolve(b64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const KATEGORI_OPTIONS = [
  'Minuman', 'Makanan Pokok', 'Bumbu & Saus',
  'Snack & Susu', 'Kebersihan', 'Lainnya',
]

/* ─── EditableRow ────────────────────────────────────── */
function EditableRow({ item, index, onChange, onRemove }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-3 py-2">
        <input
          type="text"
          value={item.nama}
          onChange={e => onChange(index, 'nama', e.target.value)}
          className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </td>
      <td className="px-3 py-2">
        <select
          value={item.kategori}
          onChange={e => onChange(index, 'kategori', e.target.value)}
          className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          {KATEGORI_OPTIONS.map(k => <option key={k}>{k}</option>)}
        </select>
      </td>
      <td className="px-3 py-2">
        <input
          type="number" min="1"
          value={item.stok}
          onChange={e => onChange(index, 'stok', parseInt(e.target.value) || 0)}
          className="w-16 text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number" min="0"
          value={item.hpp}
          onChange={e => onChange(index, 'hpp', parseInt(e.target.value) || 0)}
          className="w-24 text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number" min="0"
          value={item.hargaJual}
          onChange={e => onChange(index, 'hargaJual', parseInt(e.target.value) || 0)}
          className="w-24 text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="date"
          value={item.expired ?? ''}
          onChange={e => onChange(index, 'expired', e.target.value || null)}
          className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </td>
      <td className="px-3 py-2">
        <button
          onClick={() => onRemove(index)}
          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  )
}

/* ─── OcrFakturModal ─────────────────────────────────── */
export default function OcrFakturModal({ onAddMany, onClose }) {
  const [step, setStep]         = useState('upload')   // 'upload' | 'scanning' | 'review' | 'done'
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [scannedItems, setScannedItems] = useState([])
  const [error, setError]       = useState(null)
  const [dragging, setDragging] = useState(false)
  const [addedCount, setAddedCount] = useState(0)
  const fileInputRef            = useRef(null)

  /* ── file handling ── */
  function handleFileSelect(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Hanya file gambar yang didukung (JPG, PNG, WEBP)')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError(null)
    setStep('upload')
  }

  function handleInputChange(e) {
    handleFileSelect(e.target.files?.[0])
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFileSelect(e.dataTransfer.files?.[0])
  }

  /* ── OCR ── */
  async function handleScan() {
    if (!imageFile) return
    setStep('scanning')
    setError(null)

    try {
      const b64 = await fileToBase64(imageFile)
      const items = await runOCR(b64, imageFile.type)

      if (items.length === 0) {
        setError('Tidak ada data produk yang berhasil dibaca dari gambar ini. Coba foto yang lebih jelas atau dengan pencahayaan yang lebih baik.')
        setStep('upload')
        return
      }

      // Normalize & add defaults
      const normalized = items.map((item, i) => ({
        nama:            item.nama            ?? `Produk ${i + 1}`,
        kategori:        KATEGORI_OPTIONS.includes(item.kategori) ? item.kategori : 'Lainnya',
        stok:            Math.max(1, parseInt(item.stok)       || 1),
        hpp:             Math.max(0, parseInt(item.hpp)        || 0),
        hargaJual:       Math.max(0, parseInt(item.hargaJual)  || 0),
        estimasiLaku:    parseInt(item.estimasiLaku ?? item.terjualPerBulan) || 10,
        stokMin:         parseInt(item.stokMin)                || 5,
        expired:         item.expired && item.expired !== 'null' ? item.expired : null,
      }))

      setScannedItems(normalized)
      setStep('review')
    } catch (err) {
      const status = err?.response?.status
      const serverMsg = err?.response?.data?.error ?? ''
      const msg = status === 429
        ? 'Kuota API Gemini habis. Hubungi administrator untuk memperbarui API Key.'
        : status === 400
        ? `Konfigurasi API tidak valid. ${serverMsg}`
        : `Gagal memproses gambar: ${(serverMsg || err?.message) ?? 'Unknown error'}`
      setError(msg)
      setStep('upload')
    }
  }

  /* ── edit scanned items ── */
  function handleItemChange(index, field, value) {
    setScannedItems(prev =>
      prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
    )
  }

  function handleItemRemove(index) {
    setScannedItems(prev => prev.filter((_, i) => i !== index))
  }

  /* ── confirm add ── */
  function handleConfirm() {
    const valid = scannedItems.filter(item =>
      item.nama.trim() && item.stok > 0 && item.hargaJual > 0
    )
    if (valid.length === 0) return
    onAddMany(valid)
    setAddedCount(valid.length)
    setStep('done')
  }

  /* ── reset ── */
  function handleReset() {
    setStep('upload')
    setImageFile(null)
    setImagePreview(null)
    setScannedItems([])
    setError(null)
  }

  /* ── render ── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
           style={{ maxWidth: step === 'review' ? '900px' : '520px', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-violet-100 p-2 rounded-xl">
              <ScanText size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">Scan Faktur Pembelian (AI OCR)</h2>
              <p className="text-xs text-gray-400">Upload foto faktur → AI baca otomatis → tambah ke inventaris</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 px-6 pt-4 pb-2">
          {[
            { key: 'upload',   label: '1. Upload' },
            { key: 'scanning', label: '2. Scan AI' },
            { key: 'review',   label: '3. Review' },
            { key: 'done',     label: '4. Selesai' },
          ].map(({ key, label }, i, arr) => {
            const steps = ['upload', 'scanning', 'review', 'done']
            const currentIdx = steps.indexOf(step)
            const stepIdx    = steps.indexOf(key)
            const done   = stepIdx < currentIdx
            const active = stepIdx === currentIdx
            return (
              <div key={key} className="flex items-center flex-1">
                <div className={[
                  'flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full transition-colors',
                  done   ? 'text-emerald-700 bg-emerald-50' :
                  active ? 'text-violet-700 bg-violet-50' :
                           'text-gray-400'
                ].join(' ')}>
                  <div className={[
                    'w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold',
                    done   ? 'bg-emerald-500 text-white' :
                    active ? 'bg-violet-600 text-white' :
                             'bg-gray-200 text-gray-400'
                  ].join(' ')}>
                    {done ? '✓' : i + 1}
                  </div>
                  {label}
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-px mx-1 ${done ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* ── STEP: upload ── */}
          {(step === 'upload') && (
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={[
                  'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors',
                  dragging
                    ? 'border-violet-400 bg-violet-50'
                    : imagePreview
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50/50',
                ].join(' ')}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleInputChange}
                />
                {imagePreview ? (
                  <div className="space-y-3">
                    <img
                      src={imagePreview}
                      alt="Preview faktur"
                      className="max-h-48 mx-auto rounded-xl object-contain shadow-sm"
                    />
                    <p className="text-xs text-emerald-600 font-semibold">
                      ✓ {imageFile?.name} ({(imageFile?.size / 1024).toFixed(0)} KB)
                    </p>
                    <p className="text-xs text-gray-400">Klik untuk ganti gambar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                      <ImageIcon size={24} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Drag & drop atau klik untuk upload
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Foto faktur / nota pembelian (JPG, PNG, WEBP — maks 10MB)
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                      <span>📄 Nota tangan</span>
                      <span>🖨️ Faktur cetak</span>
                      <span>📱 Foto struk</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertTriangle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              {/* Tips */}
              <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-blue-700">💡 Tips agar hasil OCR optimal:</p>
                <ul className="text-xs text-blue-600 space-y-1 pl-3 list-disc">
                  <li>Foto dengan pencahayaan yang baik, hindari bayangan</li>
                  <li>Posisi kamera tegak lurus di atas faktur</li>
                  <li>Pastikan seluruh teks faktur terlihat jelas</li>
                  <li>Resolusi minimal 720p / 1 MP</li>
                </ul>
              </div>
            </div>
          )}

          {/* ── STEP: scanning ── */}
          {step === 'scanning' && (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-violet-50 rounded-2xl flex items-center justify-center">
                  <ScanText size={36} className="text-violet-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
                  <Loader2 size={14} className="text-violet-600 animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-gray-800">AI sedang membaca faktur…</p>
                <p className="text-xs text-gray-400">Gemini Vision menganalisis gambar dan mengekstrak data produk</p>
                <p className="text-xs text-gray-300">Biasanya selesai dalam 5–15 detik</p>
              </div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Faktur yang sedang di-scan"
                  className="max-h-32 rounded-xl object-contain shadow-sm opacity-60"
                />
              )}
            </div>
          )}

          {/* ── STEP: review ── */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-sm font-semibold text-gray-800">
                    {scannedItems.length} produk berhasil dibaca
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-violet-600 font-medium transition-colors"
                >
                  <RefreshCw size={12} />
                  Scan Ulang
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <Edit3 size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    Periksa dan koreksi data di bawah ini sebelum menambahkan ke inventaris.
                    Semua kolom dapat diedit langsung.
                  </p>
                </div>
              </div>

              {/* Editable table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-3 py-2 text-xs font-semibold text-gray-500 min-w-[160px]">Nama Produk</th>
                      <th className="px-3 py-2 text-xs font-semibold text-gray-500 min-w-[120px]">Kategori</th>
                      <th className="px-3 py-2 text-xs font-semibold text-gray-500">Stok</th>
                      <th className="px-3 py-2 text-xs font-semibold text-gray-500">HPP (Rp)</th>
                      <th className="px-3 py-2 text-xs font-semibold text-gray-500">Harga Jual (Rp)</th>
                      <th className="px-3 py-2 text-xs font-semibold text-gray-500">Expired</th>
                      <th className="px-3 py-2 text-xs font-semibold text-gray-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scannedItems.map((item, i) => (
                      <EditableRow
                        key={i}
                        item={item}
                        index={i}
                        onChange={handleItemChange}
                        onRemove={handleItemRemove}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── STEP: done ── */}
          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-800">
                  {addedCount} Baris Barang Berhasil Diproses!
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Stok inventaris dan HPP rata-rata sudah diperbarui
                </p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-violet-50 hover:bg-violet-100
                           text-violet-700 text-sm font-semibold rounded-xl transition-colors"
              >
                <ScanText size={15} />
                Scan Faktur Lain
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          {step === 'upload' && (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600
                           bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleScan}
                disabled={!imageFile}
                className={[
                  'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-colors',
                  imageFile
                    ? 'bg-violet-600 hover:bg-violet-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                ].join(' ')}
              >
                <ScanText size={16} />
                Mulai Scan AI
              </button>
            </>
          )}

          {step === 'review' && (
            <>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600
                           bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Scan Ulang
              </button>
              <button
                onClick={handleConfirm}
                disabled={scannedItems.length === 0}
                className={[
                  'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-colors',
                  scannedItems.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                ].join(' ')}
              >
                <Plus size={16} />
                Tambah {scannedItems.length} Produk ke Inventaris
              </button>
            </>
          )}

          {step === 'done' && (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700
                         text-white rounded-xl transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
