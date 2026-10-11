import { useState, useCallback } from 'react'
import axios from 'axios'
import { getProductStatus } from '../utils/kpi'
import {
  Brain, Loader2, RefreshCw, AlertTriangle, ShoppingCart,
  TrendingDown, Zap, ChevronDown, ChevronUp, Activity,
  CircleDollarSign, BadgeAlert, ShieldCheck,
} from 'lucide-react'

/* ── helpers ─────────────────────────────────────────── */
const CATEGORY_CONFIG = {
  URGENT_PROMO: {
    label:   'Promo Darurat',
    icon:    BadgeAlert,
    bg:      'bg-red-50',
    border:  'border-red-200',
    iconBg:  'bg-red-100',
    iconClr: 'text-red-600',
    badge:   'bg-red-100 text-red-700',
    dot:     'bg-red-500',
  },
  STOCK_REORDER: {
    label:   'Reorder Stok',
    icon:    ShoppingCart,
    bg:      'bg-amber-50',
    border:  'border-amber-200',
    iconBg:  'bg-amber-100',
    iconClr: 'text-amber-600',
    badge:   'bg-amber-100 text-amber-700',
    dot:     'bg-amber-500',
  },
  DEAD_STOCK: {
    label:   'Dead-Stock',
    icon:    TrendingDown,
    bg:      'bg-purple-50',
    border:  'border-purple-200',
    iconBg:  'bg-purple-100',
    iconClr: 'text-purple-600',
    badge:   'bg-purple-100 text-purple-700',
    dot:     'bg-purple-500',
  },
}

function healthColor(score) {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-500'
  return 'text-red-500'
}

function healthLabel(score) {
  if (score >= 80) return 'Sehat'
  if (score >= 60) return 'Perlu Perhatian'
  return 'Kritis'
}

/* ── InsightCard ─────────────────────────────────────── */
function InsightCard({ insight, index }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = CATEGORY_CONFIG[insight.category] ?? CATEGORY_CONFIG.URGENT_PROMO
  const Icon = cfg.icon

  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
      {/* header row */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start gap-3 p-4 text-left hover:brightness-95 transition-all"
      >
        <div className={`w-8 h-8 rounded-xl ${cfg.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <Icon size={15} className={cfg.iconClr} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {cfg.label}
            </span>
            <span className="text-xs text-gray-400">#{index + 1}</span>
          </div>
          <p className="text-sm font-bold text-gray-800 mt-1 leading-snug">{insight.target_product}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{insight.issue_detected}</p>
        </div>
        <div className="flex-shrink-0 mt-1">
          {expanded
            ? <ChevronUp size={15} className="text-gray-400" />
            : <ChevronDown size={15} className="text-gray-400" />
          }
        </div>
      </button>

      {/* expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-current/10">
          {/* financial impact */}
          <div className="flex items-start gap-2 mt-3">
            <CircleDollarSign size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Dampak Finansial</p>
              <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{insight.financial_impact}</p>
            </div>
          </div>
          {/* action plan */}
          <div className="flex items-start gap-2">
            <Zap size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Rencana Tindakan (1×24 Jam)</p>
              <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{insight.action_plan}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main Component ──────────────────────────────────── */
export default function AgentInsightPanel({ items = [] }) {
  const [result,  setResult]  = useState(null)   // parsed agent response
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [expanded, setExpanded] = useState(true)

  const runAgent = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Lampirkan status yang sudah dihitung agar agent punya konteks lebih kaya
      const inventoryWithStatus = items.map(p => ({
        ...p,
        _status: getProductStatus(p),
      }))
      const resp = await axios.post('/api/agent', {
        inventory: inventoryWithStatus,
        referenceDate: '2026-10-01',
      }, { timeout: 60000 })
      setResult(resp.data)
    } catch (err) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Gagal menghubungi AI Agent.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [items])

  const urgent  = result?.insights?.filter(i => i.category === 'URGENT_PROMO')   ?? []
  const reorder = result?.insights?.filter(i => i.category === 'STOCK_REORDER')  ?? []
  const dead    = result?.insights?.filter(i => i.category === 'DEAD_STOCK')     ?? []
  const allInsights = [...urgent, ...reorder, ...dead]

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

      {/* ── Panel Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Brain size={17} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-800">AI Business Optimizer</p>
            <p className="text-xs text-gray-400">Audit inventori · Deteksi anomali · Rencana taktis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runAgent}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700
                       disabled:bg-blue-300 text-white rounded-xl transition-colors"
          >
            {loading
              ? <Loader2 size={13} className="animate-spin" />
              : <RefreshCw size={13} />
            }
            {loading ? 'Menganalisis...' : result ? 'Analisis Ulang' : 'Jalankan Analisis'}
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="px-5 py-8 flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Brain size={22} className="text-blue-600" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-300 border-t-blue-600 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">AI Agent sedang menganalisis inventori...</p>
            <p className="text-xs text-gray-400 mt-1">Memeriksa {items.length} produk · Deteksi anomali · Menyusun rencana taktis</p>
          </div>
          <div className="flex gap-1.5 mt-1">
            {['Audit stok', 'Deteksi risiko', 'Hitung kerugian', 'Susun rencana'].map((step, i) => (
              <span key={step} className="text-xs bg-blue-50 text-blue-500 px-2 py-1 rounded-full"
                style={{ opacity: 0.4 + i * 0.2 }}>
                {step}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Error State ── */}
      {!loading && error && (
        <div className="px-5 py-5 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-600">Analisis gagal</p>
            <p className="text-xs text-gray-500 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── Empty State (belum dijalankan) ── */}
      {!loading && !error && !result && (
        <div className="px-5 py-8 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
            <Activity size={20} className="text-gray-300" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Belum ada analisis</p>
            <p className="text-xs text-gray-400 mt-1">
              Klik <span className="font-semibold text-blue-600">Jalankan Analisis</span> untuk mengaudit {items.length} produk inventori Anda.
            </p>
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {!loading && result && expanded && (
        <div className="px-5 py-5 space-y-5">

          {/* Summary bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-lg font-black text-gray-800">{result.summary?.total_produk_dianalisis ?? items.length}</p>
              <p className="text-xs text-gray-400">Produk Dianalisis</p>
            </div>
            <div className="bg-red-50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-lg font-black text-red-600">{result.summary?.produk_bermasalah ?? allInsights.length}</p>
              <p className="text-xs text-gray-400">Produk Bermasalah</p>
            </div>
            <div className="bg-amber-50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-sm font-black text-amber-600 leading-tight">{result.summary?.estimasi_total_kerugian ?? '—'}</p>
              <p className="text-xs text-gray-400">Est. Kerugian</p>
            </div>
            <div className="bg-emerald-50 rounded-xl px-3 py-2.5 text-center">
              <p className={`text-lg font-black ${healthColor(result.summary?.health_score ?? 0)}`}>
                {result.summary?.health_score ?? '—'}
              </p>
              <p className="text-xs text-gray-400">
                Health Score
                {result.summary?.health_score != null && (
                  <span className="ml-1">({healthLabel(result.summary.health_score)})</span>
                )}
              </p>
            </div>
          </div>

          {/* Rekomendasi utama */}
          {result.summary?.rekomendasi_utama && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <ShieldCheck size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                <span className="font-bold">Rekomendasi Utama: </span>{result.summary.rekomendasi_utama}
              </p>
            </div>
          )}

          {/* Insight cards */}
          {allInsights.length > 0 ? (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {allInsights.length} Insight Terdeteksi — Klik untuk detail & rencana tindakan
              </p>
              {allInsights.map((insight, i) => (
                <InsightCard key={i} insight={insight} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <ShieldCheck size={24} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-emerald-600">Inventori dalam kondisi sehat!</p>
              <p className="text-xs text-gray-400">Tidak ada anomali kritis yang terdeteksi.</p>
            </div>
          )}

          {/* Footer model info */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
            <Zap size={10} className="text-emerald-500" />
            <span className="text-xs text-gray-400">
              Dianalisis oleh {result._model ?? 'Gemini AI'} · {result.timestamp ? new Date(result.timestamp).toLocaleString('id-ID') : 'baru saja'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
