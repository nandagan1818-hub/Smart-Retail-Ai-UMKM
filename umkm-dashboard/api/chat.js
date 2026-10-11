// api/chat.js — Vercel Serverless Function
// Proxy untuk Gemini generateContent.
// API key TIDAK pernah keluar ke browser — hanya ada di environment variable server.

const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
]

const SYSTEM_PROMPT = `Kamu adalah Asisten Utama Toko UMKM "Smart Retail AI". 
Tugasmu membantu pemilik toko menganalisis inventaris, mengidentifikasi produk yang perlu dipromosikan, dan membuat teks promosi WhatsApp yang menarik dan siap kirim.
Selalu jawab dalam Bahasa Indonesia yang ramah dan profesional.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY tidak dikonfigurasi di server.' })
  }

  const { text } = req.body ?? {}
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Field "text" wajib diisi.' })
  }

  let lastErr
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      })

      if (!upstream.ok) {
        const errBody = await upstream.json().catch(() => ({}))
        // retry on quota / service-unavailable / model-not-found
        if ([429, 503, 404].includes(upstream.status)) {
          lastErr = { status: upstream.status, message: errBody?.error?.message ?? upstream.statusText }
          continue
        }
        return res.status(upstream.status).json({ error: errBody?.error?.message ?? upstream.statusText })
      }

      const data = await upstream.json()
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!reply) {
        lastErr = { status: 500, message: 'empty_response' }
        continue
      }
      return res.status(200).json({ text: reply, model })
    } catch (err) {
      lastErr = { status: 500, message: err.message }
    }
  }

  const status = lastErr?.status ?? 500
  return res.status(status >= 400 ? status : 500).json({ error: lastErr?.message ?? 'AI tidak tersedia.' })
}
