import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { AI_MODE } from '../config/langflow'
import { CRM_SEGMENTS } from '../data/crm'
import {
  MessageCircle, X, Send, Bot, User, Loader2, Copy, Check,
  Zap, Users, ChevronDown
} from 'lucide-react'

/* ─── Dynamic Pricing Engine ─────────────────────────── */
/**
 * Hitung diskon dinamis berdasarkan sisa hari expired dan stok.
 * Returns { pct: number, label: string, reason: string }
 */
function calcDynamicDiscount(product) {
  const REFERENCE_DATE = new Date('2026-10-01')

  let expiredDays = null
  if (product.expired) {
    const expDate = new Date(product.expired)
    expiredDays   = Math.ceil((expDate - REFERENCE_DATE) / (1000 * 60 * 60 * 24))
  }

  // Stok ratio vs estimasi laku bulanan
  const estimasi   = product.estimasiLaku ?? product.terjualPerBulan ?? 0
  const stokRatio  = estimasi > 0 ? product.stok / estimasi : 99

  let discountPct = 0
  let label       = 'Tidak ada diskon'
  let reason      = ''
  let urgency     = 'low'   // low | medium | high | critical

  // ── Prioritas 1: Expired-based ──
  if (expiredDays !== null) {
    if (expiredDays <= 0) {
      discountPct = 70
      label       = 'Diskon 70% — SUDAH EXPIRED'
      reason      = `Produk sudah melewati tanggal expired`
      urgency     = 'critical'
    } else if (expiredDays <= 7) {
      discountPct = 50
      label       = `Diskon 50% — Expired ${expiredDays} hari lagi`
      reason      = `Hanya tersisa ${expiredDays} hari sebelum expired (≤7 hari)`
      urgency     = 'critical'
    } else if (expiredDays <= 14) {
      discountPct = 40
      label       = `Diskon 40% — Expired ${expiredDays} hari lagi`
      reason      = `Sisa ${expiredDays} hari sebelum expired (8–14 hari)`
      urgency     = 'high'
    } else if (expiredDays <= 30) {
      discountPct = 30
      label       = `Diskon 30% — Expired ${expiredDays} hari lagi`
      reason      = `Sisa ${expiredDays} hari sebelum expired (15–30 hari)`
      urgency     = 'high'
    } else if (expiredDays <= 60) {
      discountPct = 20
      label       = `Diskon 20% — Expired ${expiredDays} hari lagi`
      reason      = `Sisa ${expiredDays} hari sebelum expired (31–60 hari)`
      urgency     = 'medium'
    }
  }

  // ── Prioritas 2: Dead-stock-based (jika lebih tinggi dari expired) ──
  if (stokRatio > 5 && discountPct < 25) {
    discountPct = 25
    label       = `Diskon 25% — Dead-Stock (${stokRatio.toFixed(1)}x stok bulanan)`
    reason      = `Stok ${product.stok} pcs, estimasi laku hanya ${estimasi}/bulan (${stokRatio.toFixed(1)}× overstok)`
    urgency     = urgency === 'low' ? 'medium' : urgency
  } else if (stokRatio > 3 && discountPct < 15) {
    discountPct = 15
    label       = `Diskon 15% — Stok Menumpuk`
    reason      = `Stok ${product.stok} pcs, estimasi laku ${estimasi}/bulan (${stokRatio.toFixed(1)}× overstok)`
    urgency     = urgency === 'low' ? 'medium' : urgency
  }

  // Harga setelah diskon
  const hargaCoret   = product.hargaJual
  const hargaPromo   = Math.round(hargaCoret * (1 - discountPct / 100) / 100) * 100
  const hargaMinProfit = product.hpp ? Math.round(product.hpp * 1.05) : null

  return {
    pct:          discountPct,
    label,
    reason,
    urgency,
    hargaCoret,
    hargaPromo:   Math.max(hargaPromo, hargaMinProfit ?? 0),
    expiredDays,
    stokRatio,
  }
}

/* ─── AI helpers (semua panggilan ke server-side API route) ── */
async function callGemini(text) {
  const res = await axios.post('/api/chat', { text }, { timeout: 30000 })
  return { text: res.data.text, model: res.data.model }
}

async function callLangflow(text) {
  const res = await axios.post('/api/langflow', { text }, { timeout: 65000 })
  return res.data.text
}

async function sendToAI(text) {
  if (AI_MODE === 'gemini-only') {
    const { text: reply, model } = await callGemini(text)
    return { text: reply, via: `Gemini (${model})` }
  }
  try {
    const txt = await callLangflow(text)
    return { text: txt, via: 'LangFlow' }
  } catch (lfErr) {
    console.warn('[LangFlow gagal, coba Gemini]', lfErr?.message)
    const { text: reply, model } = await callGemini(text)
    return { text: reply, via: `Gemini (${model})` }
  }
}

/* ─── ChatBubble ─────────────────────────────────────── */
function ChatBubble({ msg }) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`p-1.5 rounded-full flex-shrink-0 ${isUser ? 'bg-blue-600' : 'bg-gray-200'}`}>
        {isUser
          ? <User size={14} className="text-white" />
          : <Bot size={14} className="text-gray-600" />
        }
      </div>
      <div className="max-w-[75%] group relative">
        <div className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed
          ${isUser ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}
        >
          {msg.content}
        </div>
        {/* Dynamic pricing badge */}
        {msg.discount && (
          <div className={[
            'mt-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border',
            msg.discount.urgency === 'critical' ? 'bg-red-50 border-red-200 text-red-700' :
            msg.discount.urgency === 'high'     ? 'bg-orange-50 border-orange-200 text-orange-700' :
            msg.discount.urgency === 'medium'   ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                  'bg-gray-50 border-gray-200 text-gray-600'
          ].join(' ')}>
            <div className="font-bold">{msg.discount.label}</div>
            <div className="font-normal opacity-80 mt-0.5">{msg.discount.reason}</div>
            {msg.discount.pct > 0 && (
              <div className="mt-1 font-bold">
                Harga Promo: Rp {msg.discount.hargaPromo.toLocaleString('id-ID')}
                <span className="font-normal line-through ml-1 opacity-60">
                  Rp {msg.discount.hargaCoret.toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>
        )}
        {/* CRM segment badge */}
        {msg.segment && (
          <div className={`mt-1 px-2.5 py-1 rounded-xl text-xs font-semibold border inline-flex items-center gap-1.5 ${CRM_SEGMENTS[msg.segment]?.color} border-current/20`}>
            <Users size={11} />
            Target: {CRM_SEGMENTS[msg.segment]?.emoji} {CRM_SEGMENTS[msg.segment]?.label}
            <span className="font-normal opacity-70">· {CRM_SEGMENTS[msg.segment]?.channel}</span>
          </div>
        )}
        {!isUser && msg.via && (
          <div className="flex items-center gap-1 mt-1">
            <Zap size={9} className="text-emerald-500" />
            <span className="text-xs text-gray-400">{msg.via}</span>
          </div>
        )}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50"
            title="Copy teks"
          >
            {copied
              ? <Check size={11} className="text-emerald-500" />
              : <Copy size={11} className="text-gray-400" />
            }
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── CRM Segment Picker (inside chat header) ────────── */
function CrmPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const seg = CRM_SEGMENTS[value]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs bg-blue-500 hover:bg-blue-400 text-white px-2.5 py-1 rounded-lg transition-colors"
      >
        <Users size={11} />
        {seg?.emoji} {seg?.label}
        <ChevronDown size={10} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-52">
          {Object.entries(CRM_SEGMENTS).map(([key, s]) => (
            <button
              key={key}
              onClick={() => { onChange(key); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors flex items-center gap-2
                ${value === key ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'}`}
            >
              <span>{s.emoji}</span>
              <div>
                <div className="font-semibold">{s.label}</div>
                <div className="text-gray-400 truncate">{s.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main Widget ────────────────────────────────────── */
export default function AgentChatWidget({ promoProduct, onPromoClear }) {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 0, role: 'ai',
      content: 'Halo! Saya Asisten Smart Retail AI.\n\nKlik "Promo" di tabel produk untuk mendapatkan rekomendasi diskon dinamis + teks promo WhatsApp yang ditargetkan ke segmen pelanggan tertentu.\n\nAtau tanyakan langsung tentang inventaris toko Anda! 💬'
    }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [crmSegment, setCrmSegment] = useState('all')
  const bottomRef             = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  /* ── Auto-trigger dari tombol Promo ── */
  useEffect(() => {
    if (!promoProduct) return

    const product = promoProduct
    onPromoClear()
    setOpen(true)

    // ── 1. Hitung dynamic pricing ──
    const disc = calcDynamicDiscount(product)

    // ── 2. Ambil CRM segment info ──
    const seg = CRM_SEGMENTS[crmSegment]

    // ── 3. Build AI prompt ──
    const prompt = [
      `Kamu adalah Manajer Promo Toko UMKM "Smart Retail AI".`,
      ``,
      `DATA PRODUK:`,
      `- Nama       : ${product.nama}`,
      `- Kategori   : ${product.kategori}`,
      `- Stok       : ${product.stok} pcs`,
      `- Est. Laku/Bln: ${product.estimasiLaku ?? 0} pcs`,
      `- Harga Jual : Rp ${product.hargaJual.toLocaleString('id-ID')}`,
      `- HPP        : Rp ${(product.hpp ?? 0).toLocaleString('id-ID')}`,
      `- Tgl Expired: ${product.expired ?? 'tidak ada'}`,
      ``,
      `REKOMENDASI DYNAMIC PRICING (sudah dihitung sistem):`,
      `- ${disc.label}`,
      `- Alasan     : ${disc.reason}`,
      `- Harga Promo: Rp ${disc.hargaPromo.toLocaleString('id-ID')} (dari Rp ${disc.hargaCoret.toLocaleString('id-ID')})`,
      ``,
      `TARGET SEGMEN CRM:`,
      `- Segmen     : ${seg.label} ${seg.emoji}`,
      `- Deskripsi  : ${seg.description}`,
      `- Hook Promo : "${seg.promoHook}"`,
      `- Channel    : ${seg.channel}`,
      ``,
      `TUGAS:`,
      `1. Konfirmasi & jelaskan logika diskon ${disc.pct}% yang direkomendasikan sistem (1-2 kalimat)`,
      `2. Buat teks promo WhatsApp yang SIAP KIRIM untuk segmen "${seg.label}" dengan:`,
      `   - Opening hook sesuai segmen (gunakan: "${seg.promoHook}")`,
      `   - Nama produk, harga coret vs harga promo`,
      `   - Urgensi/deadline promo yang relevan`,
      `   - Call-to-action yang jelas`,
      `   - Emoji yang relevan & menarik`,
      `3. Satu tips tambahan spesifik untuk segmen ini`,
    ].join('\n')

    // Tambahkan user message + discount card
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: `📦 Buat promo untuk: ${product.nama}`,
      discount: disc,
      segment: crmSegment,
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    sendToAI(prompt)
      .then(({ text: reply, via }) => {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', content: reply, via }])
      })
      .catch(err => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'ai',
          content: buildErrMsg(err)
        }])
      })
      .finally(() => setLoading(false))

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoProduct])

  /* ── Manual send ── */
  async function sendMessage(text) {
    if (!text.trim()) return
    const userMsg = { id: Date.now(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const { text: reply, via } = await sendToAI(text)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', content: reply, via }])
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', content: buildErrMsg(err) }])
    } finally {
      setLoading(false)
    }
  }

  function buildErrMsg(err) {
    const status = err?.response?.status
    const serverMsg = err?.response?.data?.error ?? ''
    if (status === 429)
      return '⚠️ Kuota API Gemini habis hari ini.\n\nHubungi administrator untuk memperbarui API Key di server.'
    if (status === 400)
      return `❌ Konfigurasi API tidak valid.\n\nDetail: ${serverMsg}`
    if (status === 403)
      return '❌ API Key tidak punya akses. Hubungi administrator.'
    if (status === 503)
      return '⏱️ Layanan AI tidak tersedia saat ini. Coba lagi beberapa saat.'
    if (err?.code === 'ECONNABORTED' || err?.code === 'ERR_NETWORK')
      return '⏱️ Koneksi timeout. Pastikan server berjalan dan coba lagi.'
    return `❌ Gagal menghubungi AI.\n\nError: ${(serverMsg || err?.message) ?? ''}`
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all"
        aria-label="Buka Chat AI"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ maxHeight: '70vh' }}
        >
          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-1.5 rounded-full">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Smart Retail AI</p>
                <p className="text-blue-200 text-xs">Dynamic Pricing · CRM Promo</p>
              </div>
            </div>
            {/* CRM segment picker */}
            <CrmPicker value={crmSegment} onChange={setCrmSegment} />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="bg-gray-200 p-1.5 rounded-full flex-shrink-0">
                  <Bot size={14} className="text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Loader2 size={13} className="animate-spin" />
                    <span className="text-xs">AI sedang memproses... (maks 2 menit)</span>
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <textarea
              rows={1}
              placeholder="Tulis pesan..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="flex-1 resize-none text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-xl px-3 transition-colors"
              aria-label="Kirim"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
