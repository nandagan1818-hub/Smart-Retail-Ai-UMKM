import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath } from 'url'
import { resolve } from 'path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// ─── Local API middleware (menggantikan Vercel dev untuk pengembangan lokal) ───
// Membaca handler dari api/*.js dan mengeksposnya di /api/* tanpa perlu `vercel dev`.
function localApiPlugin(env) {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        // Parse JSON body
        const buffers = []
        for await (const chunk of req) buffers.push(chunk)
        let body = {}
        try { body = JSON.parse(Buffer.concat(buffers).toString()) } catch {}

        // Inject env vars ke process.env agar handler bisa membacanya
        for (const [k, v] of Object.entries(env)) {
          if (!k.startsWith('VITE_')) process.env[k] = v
        }

        // Route ke handler yang sesuai — gunakan absolute path agar benar
        // di dalam .vite-temp sekalipun
        const route = req.url.split('?')[0]   // /api/chat, /api/langflow, dll
        let handlerPath
        if      (route === '/api/chat')     handlerPath = resolve(__dirname, 'api/chat.js')
        else if (route === '/api/langflow') handlerPath = resolve(__dirname, 'api/langflow.js')
        else if (route === '/api/ocr')      handlerPath = resolve(__dirname, 'api/ocr.js')
        else if (route === '/api/agent')    handlerPath = resolve(__dirname, 'api/agent.js')
        else                                return next()

        // Buat req/res ala Vercel (minimal subset)
        const mockReq = { method: req.method, body, headers: req.headers, url: req.url }
        const mockRes = {
          _status: 200,
          _headers: {},
          status(code)  { this._status = code; return this },
          setHeader(k, v){ this._headers[k] = v; return this },
          json(data) {
            res.writeHead(this._status, { 'Content-Type': 'application/json', ...this._headers })
            res.end(JSON.stringify(data))
          },
        }

        try {
          // Dynamic import dengan absolute path + cache-bust agar hot-reload bekerja
          const mod = await import(`file://${handlerPath}?t=${Date.now()}`)
          const handler = mod.default ?? mod
          await handler(mockReq, mockRes)
        } catch (err) {
          console.error('[local-api]', err)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env (tanpa prefix filter agar GEMINI_API_KEY ikut terbaca)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), localApiPlugin(env)],
    server: {
      host: true,         // bind ke 0.0.0.0 → bisa diakses dari device lain & tunnel
      port: 5173,
      allowedHosts: true, // izinkan semua host: localhost, IP lokal, tunnel (loca.lt, ngrok, dll)
      // Header bypass untuk localtunnel (panitia akses via loca.lt tidak kena "Click to Continue")
      headers: {
        'bypass-tunnel-reminder': 'true',
      },
    },
  }
})
