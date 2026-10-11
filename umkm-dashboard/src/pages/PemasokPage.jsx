import { useState } from 'react'
import { Plus, Trash2, X, Building2, FileText, ChevronDown } from 'lucide-react'
import { PO_STATUS } from '../data/pemasok'
import { getSupplierForProduct } from '../utils/supplierLookup'

const fmt = (v) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)

// ── Modal Tambah Pemasok ──────────────────────────────────────
function ModalPemasok({ onAdd, onClose }) {
  const [form, setForm] = useState({ nama: '', kontak: '', email: '', alamat: '', kategori: 'Makanan Pokok' })
  const [err, setErr]   = useState({})
  const KATEGORI = ['Makanan Pokok', 'Minuman', 'Kebersihan', 'Snack & Susu', 'Bumbu & Saus', 'Lainnya']

  function submit(e) {
    e.preventDefault()
    const e2 = {}
    if (!form.nama.trim()) e2.nama = 'Nama wajib diisi'
    if (!form.kontak.trim()) e2.kontak = 'Kontak wajib diisi'
    if (Object.keys(e2).length) { setErr(e2); return }
    onAdd(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-800">Tambah Pemasok</h2>
          </div>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-3">
          {[
            { label: 'Nama Pemasok', field: 'nama', placeholder: 'CV Sumber Makmur' },
            { label: 'No. Telepon / WA', field: 'kontak', placeholder: '0812-xxxx-xxxx' },
            { label: 'Email', field: 'email', placeholder: 'email@pemasok.com' },
            { label: 'Alamat', field: 'alamat', placeholder: 'Jl. ...' },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{label} {field === 'nama' || field === 'kontak' ? <span className="text-red-500">*</span> : ''}</label>
              <input
                value={form[field]}
                onChange={e => { setForm(p => ({ ...p, [field]: e.target.value })); setErr(p => ({ ...p, [field]: undefined })) }}
                placeholder={placeholder}
                className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 ${err[field] ? 'border-red-300' : 'border-gray-200'}`}
              />
              {err[field] && <p className="text-xs text-red-500 mt-1">{err[field]}</p>}
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori Produk</label>
            <select value={form.kategori} onChange={e => setForm(p => ({ ...p, kategori: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200">
              {KATEGORI.map(k => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Batal</button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl">
              <Plus size={14} /> Tambah
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal Buat PO ─────────────────────────────────────────────
function ModalPO({ pemasokList, products, defaultProduct, onAdd, onClose }) {
  const suggestedSupplier = defaultProduct
    ? getSupplierForProduct(defaultProduct.id, products, pemasokList)
    : null
  const [pemasokId, setPemasokId] = useState(
    defaultProduct ? suggestedSupplier?.id ?? '' : pemasokList[0]?.id ?? ''
  )
  const [items, setItems]         = useState(
    defaultProduct
      ? [{ nama: defaultProduct.nama, qty: defaultProduct.stokMin ?? 10, hpp: defaultProduct.hpp ?? 0 }]
      : [{ nama: '', qty: 1, hpp: 0 }]
  )
  const [tanggal, setTanggal]   = useState(() => new Date().toISOString().slice(0, 10))
  const [catatan, setCatatan]   = useState('')

  const pemasok = pemasokList.find(p => String(p.id) === String(pemasokId))
  const total   = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.hpp) || 0), 0)

  function addItem() { setItems(prev => [...prev, { nama: '', qty: 1, hpp: 0 }]) }
  function removeItem(i) { setItems(prev => prev.filter((_, idx) => idx !== i)) }
  function updateItem(i, field, val) { setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: val } : it)) }

  function submit(e) {
    e.preventDefault()
    if (!pemasok || items.some(i => !i.nama.trim())) return
    onAdd({ tanggal, pemasokId: Number(pemasokId), pemasokNama: pemasok?.nama ?? '', items, catatan })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-emerald-600" />
            <h2 className="text-sm font-semibold text-gray-800">Buat Purchase Order</h2>
          </div>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal PO</label>
              <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Pemasok <span className="text-red-500">*</span></label>
              <select value={pemasokId} onChange={e => setPemasokId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="">Pilih pemasok</option>
                {pemasokList.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
              {pemasok && (
                <p className="text-xs text-gray-500 mt-1">
                  WhatsApp:{' '}
                  <a
                    href={`https://wa.me/${pemasok.kontak.replace(/\D/g, '').replace(/^0/, '62')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {pemasok.kontak}
                  </a>
                </p>
              )}
              {defaultProduct && !suggestedSupplier && (
                <p className="text-xs text-amber-600 mt-1">
                  Produk ini belum memiliki pemasok; silakan pilih secara manual.
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600">Item PO</label>
              <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <Plus size={12} /> Tambah Item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={item.nama} onChange={e => updateItem(i, 'nama', e.target.value)}
                    placeholder="Nama produk" className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)}
                    placeholder="Qty" className="w-16 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-right" />
                  <input type="number" min="0" value={item.hpp} onChange={e => updateItem(i, 'hpp', e.target.value)}
                    placeholder="HPP" className="w-24 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-right" />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-right text-xs text-gray-500 mt-2">Total: <span className="font-bold text-gray-800">{fmt(total)}</span></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Catatan</label>
            <input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Opsional..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Batal</button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl">
              <FileText size={14} /> Buat PO
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Halaman Utama Pemasok & PO ────────────────────────────────
export default function PemasokPage({ pemasokList, products, poList, addPemasok, deletePemasok, addPO, updatePOStatus, deletePO, defaultPOProduct, onDefaultPOClear }) {
  const [tab, setTab]               = useState('pemasok')
  const [showModalPemasok, setShowModalPemasok] = useState(false)
  const [showModalPO, setShowModalPO]           = useState(!!defaultPOProduct)
  const [confirmDeleteId, setConfirmDeleteId]   = useState(null)
  const [confirmType, setConfirmType]           = useState(null) // 'pemasok' | 'po'

  function handleDeleteConfirm() {
    if (confirmType === 'pemasok') deletePemasok(confirmDeleteId)
    else deletePO(confirmDeleteId)
    setConfirmDeleteId(null)
  }

  return (
    <div className="space-y-5">
      {/* Tab header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {[['pemasok', 'Daftar Pemasok', Building2], ['po', 'Purchase Order', FileText]].map(([key, label, Icon]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors
                ${tab === key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {tab === 'pemasok' && (
            <button onClick={() => setShowModalPemasok(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Plus size={13} /> Tambah Pemasok
            </button>
          )}
          {tab === 'po' && (
            <button onClick={() => setShowModalPO(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
              <FileText size={13} /> Buat PO
            </button>
          )}
        </div>
      </div>

      {/* Tab: Pemasok */}
      {tab === 'pemasok' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nama Pemasok</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kontak</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Alamat</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pemasokList.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.nama}</td>
                  <td className="px-4 py-3 text-gray-600">{p.kontak}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.email}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{p.kategori}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[180px] truncate">{p.alamat}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setConfirmDeleteId(p.id); setConfirmType('pemasok') }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {pemasokList.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">Belum ada data pemasok.</td></tr>
              )}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">{pemasokList.length} pemasok terdaftar</div>
        </div>
      )}

      {/* Tab: Purchase Order */}
      {tab === 'po' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">No. PO</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Pemasok</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Total</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {poList.map(po => {
                const st = PO_STATUS[po.status] ?? PO_STATUS.draft
                return (
                  <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{po.id}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{po.tanggal}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 text-xs">{po.pemasokNama}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{po.items.map(i => `${i.nama} (${i.qty})`).join(', ')}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700 text-xs">{fmt(po.total)}</td>
                    <td className="px-4 py-3">
                      <div className="relative group inline-block">
                        <button className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>
                          {st.label} <ChevronDown size={10} />
                        </button>
                        <div className="absolute left-0 top-7 z-10 bg-white border border-gray-200 rounded-xl shadow-lg hidden group-hover:block min-w-[130px]">
                          {Object.entries(PO_STATUS).map(([key, val]) => (
                            <button key={key} onClick={() => updatePOStatus(po.id, key)}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${val.text}`}>
                              {val.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setConfirmDeleteId(po.id); setConfirmType('po') }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {poList.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">Belum ada Purchase Order.</td></tr>
              )}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">{poList.length} PO tercatat</div>
        </div>
      )}

      {/* Modals */}
      {showModalPemasok && <ModalPemasok onAdd={addPemasok} onClose={() => setShowModalPemasok(false)} />}
      {showModalPO && (
        <ModalPO
          pemasokList={pemasokList}
          products={products}
          defaultProduct={defaultPOProduct}
          onAdd={addPO}
          onClose={() => { setShowModalPO(false); onDefaultPOClear?.() }}
        />
      )}

      {/* Confirm delete */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-xl"><Trash2 size={18} className="text-red-600" /></div>
              <h3 className="text-sm font-semibold text-gray-800">Hapus {confirmType === 'pemasok' ? 'Pemasok' : 'PO'}?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">Data akan dihapus secara permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Batal</button>
              <button onClick={handleDeleteConfirm} className="flex-1 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
