import { getTotalPotentialLoss, getDeadStockCount, getExpiredThisMonthCount, getHealthScore } from '../utils/kpi'
import { AlertTriangle, PackageX, Calendar, Activity } from 'lucide-react'

// SummaryCards menerima items opsional; jika tidak dikirim, pakai data default dari kpi.js

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

function KPICard({ title, value, description, icon: Icon, iconBg, iconColor, valueColor }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${iconBg} flex-shrink-0`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  )
}

function HealthScoreCard({ score }) {
  const color = score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-500' : 'text-red-500'
  const bg    = score >= 70 ? 'bg-emerald-50'   : score >= 40 ? 'bg-amber-50'    : 'bg-red-50'
  const bar   = score >= 70 ? 'bg-emerald-500'   : score >= 40 ? 'bg-amber-400'   : 'bg-red-500'
  const label = score >= 70 ? 'Sehat'            : score >= 40 ? 'Perlu Perhatian': 'Kritis'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${bg} flex-shrink-0`}>
        <Activity size={22} className={color} />
      </div>
      <div className="w-full min-w-0">
        <p className="text-sm text-gray-500 font-medium">Health Score</p>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{score}<span className="text-base font-normal text-gray-400">/100</span></p>
        <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-2 rounded-full transition-all ${bar}`} style={{ width: `${score}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  )
}

export default function SummaryCards({ items }) {
  const potentialLoss = getTotalPotentialLoss(items)
  const deadStock     = getDeadStockCount(items)
  const expired       = getExpiredThisMonthCount(items)
  const health        = getHealthScore(items)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KPICard
        title="Potensi Kerugian"
        value={formatRupiah(potentialLoss)}
        description="Nilai stok expired & dead-stock"
        icon={AlertTriangle}
        iconBg="bg-red-50"
        iconColor="text-red-500"
        valueColor="text-red-600"
      />
      <KPICard
        title="Dead-Stock"
        value={`${deadStock} Produk`}
        description="Stok menumpuk > 3 bulan"
        icon={PackageX}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
        valueColor="text-amber-600"
      />
      <KPICard
        title="Expired Bulan Ini"
        value={`${expired} Produk`}
        description="Kedaluwarsa Oktober 2026"
        icon={Calendar}
        iconBg="bg-red-50"
        iconColor="text-red-500"
        valueColor="text-red-600"
      />
      <HealthScoreCard score={health} />
    </div>
  )
}
