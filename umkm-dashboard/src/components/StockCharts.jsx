import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip,
  LineChart, Line
} from 'recharts'
import { getStockByCategory, getStatusDistribution, getTrendFinansial } from '../utils/kpi'

const formatRupiah = (v) => `${v.toLocaleString('id-ID')}`

// Menerima prop `products` — array produk mentah dengan field { nama/name, kategori/category, stok/stock, estimasiLaku/sold }
// Pengelompokan per kategori dilakukan di getStockByCategory() menggunakan .reduce()
function StockBarChart({ products }) {
  const data = getStockByCategory(products)
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Stok vs Terjual per Kategori</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="category" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => formatRupiah(v)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="stock" name="Stok" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="sold"  name="Terjual/Bulan" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const RADIAN = Math.PI / 180
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function StatusDonutChart({ items }) {
  const data = getStatusDistribution(items).filter(d => d.value > 0)
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Distribusi Status Produk</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <PieTooltip formatter={(v, name) => [`${v} produk`, name]} />
          <Legend
            formatter={(value, entry) => (
              <span style={{ color: entry.color, fontSize: 12 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

const fmtJuta = (v) => `${(v / 1_000_000).toFixed(1)}jt`

function FinancialLineChart({ items }) {
  const data = getTrendFinansial(items)
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Pendapatan vs HPP vs Laba Bersih (6 Bulan)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtJuta} />
          <Tooltip formatter={(v) => `Rp ${v.toLocaleString('id-ID')}`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="pendapatan" name="Pendapatan" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="hpp"        name="HPP (Modal)" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="laba"       name="Laba Bersih" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function StockCharts({ items }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StockBarChart products={items} />
        <StatusDonutChart items={items} />
      </div>
      <FinancialLineChart items={items} />
    </div>
  )
}
