// api/langflow.js — Vercel Serverless Function
// Proxy untuk LangFlow Desktop (hanya aktif saat LANGFLOW_BASE_URL dikonfigurasi).
// API key TIDAK pernah keluar ke browser — hanya ada di environment variable server.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const baseUrl = process.env.LANGFLOW_BASE_URL
  const flowId  = process.env.LANGFLOW_FLOW_ID
  const apiKey  = process.env.LANGFLOW_API_KEY

  if (!baseUrl || !flowId) {
    return res.status(503).json({ error: 'LangFlow tidak dikonfigurasi di server.' })
  }

  const { text } = req.body ?? {}
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Field "text" wajib diisi.' })
  }

  const url = `${baseUrl}/api/v1/run/${flowId}?stream=false`
  const headers = { 'Content-Type': 'application/json' }
  if (apiKey) headers['x-api-key'] = apiKey

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ input_value: text, output_type: 'chat', input_type: 'chat' }),
      signal: AbortSignal.timeout(60000),
    })

    if (!upstream.ok) {
      const errBody = await upstream.json().catch(() => ({}))
      return res.status(upstream.status).json({ error: errBody?.detail ?? upstream.statusText })
    }

    const data = await upstream.json()
    if (data?.detail) return res.status(500).json({ error: `LangFlow error: ${data.detail}` })

    const out = data?.outputs?.[0]?.outputs?.[0]
    const txt = out?.results?.message?.text ?? out?.messages?.[0]?.message ?? ''
    if (!txt) return res.status(500).json({ error: 'empty_response' })

    return res.status(200).json({ text: txt })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
