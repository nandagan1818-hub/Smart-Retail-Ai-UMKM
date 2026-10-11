import { getTotalPendapatan, getTotalHPP, getTotalLaba, getKerugianProdukBermasalah } from '../utils/kpi'
import { TrendingUp, ShoppingCart, DollarSign, AlertCircle } from 'lucide-react'

const fmt = (v) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)

function FinCard({ title, value, desc, icon: Icon, iconBg, iconColor, valueColor }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${iconBg} flex-shrink-0`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className={`text-xl font-bold mt-1 leading-tight ${valueColor}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-1">{desc}</p>
      </div>
    </div>
  )
}

export default function FinancialCards({ items }) {
  const pendapatan = getTotalPendapatan(items)
  const hpp        = getTotalHPP(items)
  const laba       = getTotalLaba(items)
  const kerugian   = getKerugianProdukBermasalah(items)
  const marginPct  = pendapatan > 0 ? ((laba / pendapatan) * 100).toFixed(1) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <FinCard
        title="Total Pendapatan Kotor"
        value={fmt(pendapatan)}
        desc="Estimasi dari terjual/bulan"
        icon={TrendingUp}
        iconBg="bg-blue-50"
        iconColor="text-blue-500"
        valueColor="text-blue-600"
      />
      <FinCard
        title="Total HPP (Modal)"
        value={fmt(hpp)}
        desc="Harga pokok penjualan/bulan"
        icon={ShoppingCart}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
        valueColor="text-amber-600"
      />
      <FinCard
        title="Laba Bersih"
        value={fmt(laba)}
        desc={`Margin ${marginPct}% dari pendapatan`}
        icon={DollarSign}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-500"
        valueColor="text-emerald-600"
      />
      <FinCard
        title="Kerugian Barang Bermasalah"
        value={fmt(kerugian)}
        desc="Nilai HPP stok expired & dead-stock"
        icon={AlertCircle}
        iconBg="bg-red-50"
        iconColor="text-red-500"
        valueColor="text-red-600"
      />
    </div>
  )
}
