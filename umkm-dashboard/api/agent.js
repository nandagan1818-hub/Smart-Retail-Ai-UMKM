// api/agent.js — UMKM Inventory & Business Optimizer Agent
// Menerima data inventori dari frontend, menganalisis dengan Gemini,
// dan mengembalikan insight JSON terstruktur.

const GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash']

const SYSTEM_PROMPT = `Anda adalah sebuah AI Agent otonom yang bertindak sebagai 'UMKM Inventory & Business Optimizer'.
Tugas utama Anda adalah mengaudit data inventori, mendeteksi anomali (seperti barang mati/dead-stock, produk kedaluwarsa, atau stok menipis), lalu menyusun rencana perbaikan taktis yang bisa dieksekusi langsung oleh pemilik toko.

TUJUAN ANDA:
1. Meminimalkan modal mati akibat barang yang mengendap atau kedaluwarsa.
2. Mencegah kehilangan potensi penjualan akibat stok barang laris habis (stockout).

KEMAMPUAN BERPIKIR AGENT (Chain of Thought):
Setiap kali menerima data inventori, Anda harus melakukan analisis dengan urutan berikut:
• Analisis Masalah: Apa dampak finansial dari status stok barang saat ini jika dibiarkan?
• Rencana Perbaikan: Apa tindakan darurat yang harus diambil pemilik toko dalam 1x24 jam?
• Rekomendasi Lanjutan: Bagaimana mencegah masalah ini terulang kembali di masa depan?

ATURAN OUTPUT:
• Kembalikan respon HANYA dalam format JSON mentah tanpa markdown (jangan gunakan bungkus \`\`\`json atau teks pembuka lainnya).
• Tulis pesan rekomendasi dalam Bahasa Indonesia yang ringkas, solutif, dan mudah dipahami oleh pedagang ritel tradisional.
• Pilih maksimal 5 produk paling kritis untuk URGENT_PROMO dan 3 produk paling kritis untuk STOCK_REORDER.

STRUKTUR JSON YANG WAJIB ANDA HASILKAN:
{
  "agent_status": "ANALYSIS_COMPLETE",
  "timestamp": "string_waktu_sekarang_ISO",
  "summary": {
    "total_produk_dianalisis": number,
    "produk_bermasalah": number,
    "estimasi_total_kerugian": "string_rupiah",
    "health_score": number_0_to_100,
    "rekomendasi_utama": "satu kalimat rekomendasi terpenting"
  },
  "insights": [
    {
      "category": "URGENT_PROMO",
      "target_product": "Nama Produk",
      "issue_detected": "Deskripsi singkat masalah",
      "financial_impact": "Estimasi kerugian jika tidak bertindak",
      "action_plan": "Instruksi perbaikan instan dalam 1x24 jam"
    }
  ]
}`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY tidak dikonfigurasi di server.' })
  }

  const { inventory, referenceDate } = req.body ?? {}
  if (!Array.isArray(inventory) || inventory.length === 0) {
    return res.status(400).json({ error: 'Field "inventory" wajib diisi berupa array produk.' })
  }

  // Build user prompt dengan data inventori nyata
  const inventoryText = inventory.map(p =>
    `- ${p.nama} | Kategori: ${p.kategori} | Stok: ${p.stok} pcs | Est.Laku/bln: ${p.estimasiLaku ?? 0} | HPP: Rp ${p.hpp?.toLocaleString('id-ID') ?? 0} | Harga Jual: Rp ${p.hargaJual?.toLocaleString('id-ID') ?? 0} | Stok Min: ${p.stokMin ?? 0} | Expired: ${p.expired ?? 'tidak ada'} | Status: ${p._status ?? 'normal'}`
  ).join('\n')

  const userPrompt = `Tanggal referensi analisis: ${referenceDate ?? new Date().toISOString().split('T')[0]}

DATA INVENTORI TOKO (${inventory.length} produk):
${inventoryText}

Lakukan audit inventori lengkap dan hasilkan insight JSON sesuai instruksi system prompt.`

  let lastErr
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.3,          // lebih deterministik untuk analisis bisnis
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',  // minta JSON langsung
          },
        }),
      })

      if (!upstream.ok) {
        const errBody = await upstream.json().catch(() => ({}))
        if ([429, 503, 404].includes(upstream.status)) {
          lastErr = { status: upstream.status, message: errBody?.error?.message ?? upstream.statusText }
          continue
        }
        return res.status(upstream.status).json({ error: errBody?.error?.message ?? upstream.statusText })
      }

      const data  = await upstream.json()
      const raw   = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!raw) { lastErr = { status: 500, message: 'empty_response' }; continue }

      // Parse JSON — Gemini dengan responseMimeType:application/json sudah langsung JSON
      let parsed
      try {
        parsed = JSON.parse(raw)
      } catch {
        // fallback: strip markdown jika ada
        const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
        parsed = JSON.parse(cleaned)
      }

      return res.status(200).json({ ...parsed, _model: model })
    } catch (err) {
      lastErr = { status: 500, message: err.message }
    }
  }

  const status = lastErr?.status ?? 500
  return res.status(status >= 400 ? status : 500).json({ error: lastErr?.message ?? 'AI Agent tidak tersedia.' })
}
