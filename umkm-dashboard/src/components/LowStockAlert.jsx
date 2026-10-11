import { getLowStockProducts } from '../utils/kpi'
import { AlertTriangle, ShoppingCart } from 'lucide-react'

export default function LowStockAlert({ items, onCreatePO }) {
  const lowItems = getLowStockProducts(items)
  if (lowItems.length === 0) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-yellow-600" />
        <h3 className="text-sm font-semibold text-yellow-800">
          Low-Stock Alert — {lowItems.length} produk perlu di-restock
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
        {lowItems.map(p => {
          const pct = Math.round((p.stok / p.stokMin) * 100)
          return (
            <div key={p.id} className="bg-white border border-yellow-100 rounded-xl p-3 flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{p.nama}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Stok: <span className="font-bold text-yellow-600">{p.stok}</span> / min {p.stokMin}</span>
              </div>
              <div className="h-1.5 bg-yellow-100 rounded-full overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${pct <= 50 ? 'bg-red-500' : 'bg-yellow-400'}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <button
                onClick={() => onCreatePO?.(p)}
                className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 py-1 rounded-lg transition-colors"
              >
                <ShoppingCart size={11} />
                Buat PO
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
