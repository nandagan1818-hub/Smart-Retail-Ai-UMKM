import { useState, useMemo } from 'react'
import { LOG_ACTIONS } from '../hooks/useActivityLog'
import { Search, Download, Trash2, ClipboardList, Filter } from 'lucide-react'

const ALL = 'Semua'

function exportLogsCSV(logs) {
  const headers = ['Waktu', 'Pengguna', 'Tindakan', 'Detail Perubahan']
  const rows = logs.map(l => [
    l.waktu,
    l.pengguna,
    LOG_ACTIONS[l.tindakan]?.label ?? l.tindakan,
    l.detail,
  ])
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `log-aktivitas-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function ActionBadge({ action }) {
  const cfg = LOG_ACTIONS[action]
  if (!cfg) return <span className="text-xs text-gray-400">{action}</span>
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

export default function ActivityLogPage({ logs, onClear }) {
  const [search,      setSearch]      = useState('')
  const [filterAction, setFilterAction] = useState(ALL)
  const [filterUser,   setFilterUser]   = useState(ALL)

  // Derived filter options
  const actionOptions = useMemo(() => {
    const s = new Set(logs.map(l => l.tindakan))
    return [ALL, ...Array.from(s)]
  }, [logs])

  const userOptions = useMemo(() => {
    const s = new Set(logs.map(l => l.pengguna))
    return [ALL, ...Array.from(s)]
  }, [logs])

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const q = search.trim().toLowerCase()
      const matchSearch = !q
        || l.detail.toLowerCase().includes(q)
        || l.pengguna.toLowerCase().includes(q)
        || (LOG_ACTIONS[l.tindakan]?.label ?? '').toLowerCase().includes(q)
      const matchAction = filterAction === ALL || l.tindakan === filterAction
      const matchUser   = filterUser   === ALL || l.pengguna === filterUser
      return matchSearch && matchAction && matchUser
    })
  }, [logs, search, filterAction, filterUser])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1.5 rounded-lg">
            <ClipboardList size={16} className="text-gray-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Log Aktivitas Sistem</h3>
            <p className="text-xs text-gray-400">
              {logs.length} total entri · {filtered.length} ditampilkan
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-52">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari log…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Filter Tindakan */}
          <div className="flex items-center gap-1">
            <Filter size={13} className="text-gray-400 flex-shrink-0" />
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {actionOptions.map(a => (
                <option key={a} value={a}>
                  {a === ALL ? 'Semua Tindakan' : (LOG_ACTIONS[a]?.label ?? a)}
                </option>
              ))}
            </select>
          </div>

          {/* Filter User */}
          <select
            value={filterUser}
            onChange={e => setFilterUser(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {userOptions.map(u => (
              <option key={u} value={u}>
                {u === ALL ? 'Semua Pengguna' : u}
              </option>
            ))}
          </select>

          {/* Export */}
          <button
            onClick={() => exportLogsCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-lg transition-colors flex-shrink-0"
          >
            <Download size={13} />
            Export CSV
          </button>

          {/* Clear all */}
          {logs.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex-shrink-0"
            >
              <Trash2 size={13} />
              Hapus Log
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-300 gap-3">
          <ClipboardList size={40} />
          <p className="text-sm text-gray-400">
            {logs.length === 0
              ? 'Belum ada aktivitas yang tercatat.'
              : 'Tidak ada log yang cocok dengan filter.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">#</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Waktu</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Pengguna</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Tindakan</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Detail Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((l, idx) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                    {filtered.length - idx}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-600 whitespace-nowrap">
                    {l.waktu}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {l.pengguna.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-gray-700">{l.pengguna}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <ActionBadge action={l.tindakan} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 leading-relaxed">
                    {l.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Footer ── */}
      {filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Menampilkan {filtered.length} dari {logs.length} entri
          </span>
          <span className="text-xs text-gray-300">
            Format: [Waktu] — [Pengguna] — [Tindakan] — [Detail Perubahan]
          </span>
        </div>
      )}
    </div>
  )
}
