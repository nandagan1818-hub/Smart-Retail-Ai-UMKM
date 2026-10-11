import {
  ShoppingBag, Brain, Zap, Users, BarChart3, Smartphone,
  ScanLine, Truck, ClipboardList, Shield, GitBranch, Globe,
  Cpu, PackageSearch, MessageSquareText,
} from 'lucide-react'

/* ── Data ─────────────────────────────────────────────── */
const FEATURES = [
  { icon: Brain,             color: 'bg-blue-50 text-blue-600',    title: 'Dynamic Pricing AI',       desc: 'Rekomendasi diskon otomatis berdasarkan sisa expired dan rasio dead-stock.' },
  { icon: MessageSquareText, color: 'bg-violet-50 text-violet-600',title: 'AI Chatbot (Gemini)',       desc: 'Asisten toko berbasis Gemini — buat teks promo WhatsApp siap kirim dalam detik.' },
  { icon: Users,             color: 'bg-emerald-50 text-emerald-600',title: 'CRM Segmentasi',          desc: 'Targetkan promo ke segmen pelanggan spesifik: Loyalis, Pemburu Diskon, Keluarga, dll.' },
  { icon: Smartphone,        color: 'bg-amber-50 text-amber-600',  title: 'Point of Sale (POS)',       desc: 'Kasir digital dengan keranjang belanja, riwayat transaksi, dan cetak struk thermal.' },
  { icon: ScanLine,          color: 'bg-rose-50 text-rose-600',    title: 'OCR Faktur',                desc: 'Scan faktur pembelian dengan kamera — stok otomatis terisi tanpa input manual.' },
  { icon: Truck,             color: 'bg-cyan-50 text-cyan-600',    title: 'Manajemen Pemasok & PO',    desc: 'Kelola data pemasok dan buat Purchase Order langsung dari dashboard.' },
  { icon: BarChart3,         color: 'bg-indigo-50 text-indigo-600',title: 'Analisis Visual',           desc: 'Grafik distribusi stok, kategori produk, dan ringkasan finansial HPP vs harga jual.' },
  { icon: ClipboardList,     color: 'bg-gray-100 text-gray-600',   title: 'Log Aktivitas',             desc: 'Audit trail lengkap setiap transaksi POS, tambah/hapus produk, login, dan promo.' },
]

const TECH_STACK = [
  { icon: Globe,         label: 'React 19',       sub: 'Frontend Framework' },
  { icon: Zap,           label: 'Vite 8',          sub: 'Build Tool' },
  { icon: Cpu,           label: 'Gemini AI',       sub: 'Google Generative AI' },
  { icon: PackageSearch, label: 'Tailwind CSS 4',  sub: 'Styling' },
  { icon: Shield,        label: 'Vercel',          sub: 'Hosting & Serverless' },
]

const TEAM = [
  { name: 'Nanda Pratama',    role: 'Full-Stack Developer',  initial: 'N', color: 'bg-blue-600' },
]

/* ── Sub-components ───────────────────────────────────── */
function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{title}</h2>
      {children}
    </section>
  )
}

function FeatureCard({ icon: Icon, color, title, desc }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-3 hover:shadow-sm transition-shadow">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={17} />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800 leading-snug">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function TechBadge({ icon: Icon, label, sub }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-gray-500" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
    </div>
  )
}

/* ── Main Page ────────────────────────────────────────── */
export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">

      {/* ── Hero Card ── */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white">
        <div className="flex items-start gap-5">
          <div className="bg-white/20 backdrop-blur p-4 rounded-2xl flex-shrink-0">
            <ShoppingBag size={36} className="text-white" />
          </div>
          <div>
            <p className="text-blue-200 text-xs font-semibold tracking-widest uppercase mb-1">Smart Retail AI</p>
            <h1 className="text-2xl font-black leading-tight">Dashboard UMKM</h1>
            <p className="text-blue-100 text-sm mt-2 leading-relaxed">
              Platform manajemen toko all-in-one dengan kecerdasan buatan untuk UMKM Indonesia.
              Dari inventaris hingga promosi — semua dalam satu layar.
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Fitur Utama',    value: '8+' },
            { label: 'Model AI',       value: 'Gemini' },
            { label: 'Platform',       value: 'Web & Mobile' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
              <p className="text-white font-black text-lg leading-none">{s.value}</p>
              <p className="text-blue-200 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tentang ── */}
      <Section title="Tentang Aplikasi">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-bold text-gray-800">Smart Retail AI</span> adalah sistem manajemen toko modern yang dirancang
            khusus untuk <span className="font-semibold text-blue-600">UMKM Indonesia</span>. Aplikasi ini memadukan
            teknologi AI generatif (Google Gemini) dengan alat operasional toko sehari-hari — mulai dari
            kasir, inventaris, hingga otomatisasi promosi WhatsApp.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Dibangun sebagai proyek <span className="font-semibold text-gray-800">Hackathon</span>, Smart Retail AI
            menjawab tantangan nyata yang dihadapi pelaku UMKM: bagaimana menjual lebih cepat,
            meminimalisir kerugian akibat produk mendekati expired, dan menargetkan promosi
            ke pelanggan yang tepat secara efisien.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {['#UMKM', '#AI', '#Hackathon', '#SmartRetail', '#DynamicPricing'].map(tag => (
              <span key={tag} className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Fitur ── */}
      <Section title="Fitur Unggulan">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </Section>

      {/* ── Tech Stack ── */}
      <Section title="Teknologi">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TECH_STACK.map(t => <TechBadge key={t.label} {...t} />)}
        </div>
      </Section>

      {/* ── Tim ── */}
      <Section title="Tim Pengembang">
        <div className="space-y-3">
          {TEAM.map(m => (
            <div key={m.name} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-full ${m.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-black text-base">{m.initial}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{m.name}</p>
                <p className="text-xs text-gray-400">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Links ── */}
      <Section title="Tautan">
        <div className="flex flex-wrap gap-3">
          <a
            href="https://github.com/nandagan1818-hub/smart-retail-ai"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <GitBranch size={14} />
            GitHub Repository
          </a>
          <a
            href="https://smart-retail-ai-ten.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Globe size={14} />
            Live Demo
          </a>
        </div>
      </Section>

      {/* ── Footer ── */}
      <div className="text-center pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Smart Retail AI · Versi 1.0.0 · Dibangun dengan ❤️ untuk UMKM Indonesia
        </p>
      </div>

    </div>
  )
}
