import { inventory as defaultInventory } from '../data/inventory'

// Bulan referensi: Oktober 2026
const REFERENCE_DATE = new Date('2026-10-01')
const END_OF_MONTH   = new Date('2026-10-31')

// Gunakan estimasiLaku (menggantikan terjualPerBulan yang dihapus dari schema)
function laku(p) { return p.estimasiLaku ?? p.terjualPerBulan ?? 0 }

export function getProductStatus(product) {
  const { stok, stokMin, expired } = product
  if (expired) {
    const expDate = new Date(expired)
    if (expDate <= END_OF_MONTH) return 'expired'
    const daysUntilExpiry = (expDate - REFERENCE_DATE) / (1000 * 60 * 60 * 24)
    if (daysUntilExpiry <= 30) return 'hampir-expired'
  }
  const lk = laku(product)
  if (lk > 0 && stok / lk > 3) return 'dead-stock'
  if (stokMin && stok <= stokMin) return 'low-stock'
  return 'normal'
}

export function getLowStockProducts(items = defaultInventory) {
  return items
    .filter(p => p.stokMin && p.stok <= p.stokMin && getProductStatus(p) === 'low-stock')
    .sort((a, b) => (a.stok / (a.stokMin || 1)) - (b.stok / (b.stokMin || 1)))
    .slice(0, 10)
}

export function getTotalPotentialLoss(items = defaultInventory) {
  return items.reduce((total, p) => {
    const status = getProductStatus(p)
    if (status === 'expired' || status === 'dead-stock') {
      return total + p.stok * p.hargaJual
    }
    return total
  }, 0)
}

export function getDeadStockCount(items = defaultInventory) {
  return items.filter(p => getProductStatus(p) === 'dead-stock').length
}

export function getExpiredThisMonthCount(items = defaultInventory) {
  return items.filter(p => getProductStatus(p) === 'expired').length
}

export function getHealthScore(items = defaultInventory) {
  const total = items.length
  if (total === 0) return 100
  const expired       = getExpiredThisMonthCount(items)
  const deadStock     = getDeadStockCount(items)
  const hampirExpired = items.filter(p => getProductStatus(p) === 'hampir-expired').length
  const penalty = expired * 10 + deadStock * 5 + hampirExpired * 2
  return Math.max(0, Math.round(100 - (penalty / total) * 10))
}

export function getStockByCategory(items = defaultInventory) {
  // Kelompokkan & jumlahkan stok+sold per kategori menggunakan .reduce()
  // Output shape: { category, stock, sold } — cocok langsung untuk BarChart
  return Object.values(
    items.reduce((map, p) => {
      const cat = p.kategori
      if (!map[cat]) map[cat] = { category: cat, stock: 0, sold: 0 }
      map[cat].stock += p.stok
      map[cat].sold  += laku(p)
      return map
    }, {})
  )
}

export function getStatusDistribution(items = defaultInventory) {
  const counts = { normal: 0, 'dead-stock': 0, 'hampir-expired': 0, expired: 0 }
  items.forEach(p => { counts[getProductStatus(p)]++ })
  return [
    { name: 'Normal',         value: counts.normal,            color: '#10B981' },
    { name: 'Dead-Stock',     value: counts['dead-stock'],     color: '#F59E0B' },
    { name: 'Hampir Expired', value: counts['hampir-expired'], color: '#FBBF24' },
    { name: 'Expired',        value: counts.expired,           color: '#EF4444' },
  ]
}

// ── Finansial (HPP & P&L) ─────────────────────────────────────

// Pendapatan estimasi = Σ (hargaJual × estimasiLaku)
export function getTotalPendapatan(items = defaultInventory) {
  return items.reduce((sum, p) => sum + p.hargaJual * laku(p), 0)
}

// Total HPP = Σ (hpp × estimasiLaku)
export function getTotalHPP(items = defaultInventory) {
  return items.reduce((sum, p) => sum + (p.hpp ?? 0) * laku(p), 0)
}

// Laba bersih = pendapatan - HPP
export function getTotalLaba(items = defaultInventory) {
  return getTotalPendapatan(items) - getTotalHPP(items)
}

// Kerugian akibat expired & dead-stock dihitung dari nilai HPP stok bermasalah
export function getKerugianProdukBermasalah(items = defaultInventory) {
  return items.reduce((sum, p) => {
    const status = getProductStatus(p)
    if (status === 'expired' || status === 'dead-stock') {
      return sum + (p.hpp ?? p.hargaJual) * p.stok
    }
    return sum
  }, 0)
}

// Data tren bulanan untuk line chart (6 bulan ke belakang dari Oktober 2026)
export function getTrendFinansial(items = defaultInventory) {
  const bulan  = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt']
  const faktor = [0.78, 0.83, 0.88, 0.92, 0.96, 1.00]
  const pendapatanBulanIni = getTotalPendapatan(items)
  const hppBulanIni        = getTotalHPP(items)
  const labaBulanIni       = pendapatanBulanIni - hppBulanIni
  return bulan.map((bln, i) => ({
    bulan: bln,
    pendapatan: Math.round(pendapatanBulanIni * faktor[i]),
    hpp:        Math.round(hppBulanIni        * faktor[i]),
    laba:       Math.round(labaBulanIni       * faktor[i]),
  }))
}
