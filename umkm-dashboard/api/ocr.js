// api/ocr.js — Vercel Serverless Function
// Proxy untuk Gemini Vision (OCR faktur).
// API key TIDAK pernah keluar ke browser — hanya ada di environment variable server.

const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
]

const OCR_PROMPT = `Kamu adalah sistem OCR untuk faktur pembelian toko retail Indonesia.

Analisis gambar faktur/nota pembelian ini dan ekstrak semua baris produk yang ada.

Untuk setiap produk yang ditemukan, kembalikan data dalam format JSON array yang VALID:
[
  {
    "nama": "nama produk lengkap",
    "kategori": "salah satu dari: Minuman, Makanan Pokok, Bumbu & Saus, Snack & Susu, Kebersihan, Lainnya",
    "stok": angka jumlah unit yang dibeli (integer),
    "hpp": angka harga beli per unit dalam Rupiah (integer, tanpa simbol),
    "hargaJual": angka estimasi harga jual (hpp × 1.25, dibulatkan ke ratusan terdekat),
    "estimasiLaku": 10,
    "stokMin": 5,
    "expired": "YYYY-MM-DD atau null jika tidak ada"
  }
]

PENTING:
- Jika ada informasi expired/kadaluarsa di faktur, gunakan format YYYY-MM-DD
- Jika tidak ada expired, gunakan null
- hpp adalah harga beli (harga dari supplier)
- hargaJual adalah estimasimu (hpp × 1.25)
- Kembalikan HANYA array JSON yang valid, tanpa markdown, tanpa penjelasan tambahan
- Jika gambar bukan faktur atau tidak bisa dibaca, kembalikan array kosong: []`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY tidak dikonfigurasi di server.' })
  }

  const { base64Image, mimeType } = req.body ?? {}
  if (!base64Image || !mimeType) {
    return res.status(400).json({ error: 'Field "base64Image" dan "mimeType" wajib diisi.' })
  }

  let lastErr
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: OCR_PROMPT },
              { inline_data: { mime_type: mimeType, data: base64Image } },
            ],
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
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

      const data = await upstream.json()
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      const cleaned = raw.replace(/```(?:json)?\n?/g, '').trim()
      const parsed = JSON.parse(cleaned)
      if (!Array.isArray(parsed)) throw new Error('Bukan array')
      return res.status(200).json({ items: parsed })
    } catch (err) {
      lastErr = { status: 500, message: err.message }
      // parse error: try next model
    }
  }

  const status = lastErr?.status ?? 500
  return res.status(status >= 400 ? status : 500).json({ error: lastErr?.message ?? 'OCR gagal.' })
}
