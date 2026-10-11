import { AlertTriangle, X, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { inventory as defaultInventory } from '../data/inventory'
import { getProductStatus } from '../utils/kpi'

export default function AlertBanner({ items = defaultInventory }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const expired = items.filter(p => getProductStatus(p) === 'expired')
  const hampir  = items.filter(p => getProductStatus(p) === 'hampir-expired')

  if (expired.length === 0 && hampir.length === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 relative">
      <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
        <AlertTriangle size={18} className="text-red-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-700">⚠️ Perhatian — Produk Membutuhkan Tindakan Segera</p>
        <div className="mt-2 space-y-1">
          {expired.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-xs font-medium text-red-600 flex-shrink-0">Expired bulan ini:</span>
              {expired.map(p => (
                <span key={p.id} className="inline-flex items-center gap-0.5 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  <ChevronRight size={10} />{p.nama}
                </span>
              ))}
            </div>
          )}
          {hampir.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-xs font-medium text-amber-600 flex-shrink-0">Hampir expired:</span>
              {hampir.map(p => (
                <span key={p.id} className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  <ChevronRight size={10} />{p.nama}
                </span>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-red-500 mt-2">Klik "Buat Promo" di tabel untuk langsung generate strategi promo WhatsApp.</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-red-400 hover:text-red-600 flex-shrink-0 transition-colors"
        aria-label="Tutup"
      >
        <X size={16} />
      </button>
    </div>
  )
}
