// ─────────────────────────────────────────────────────────────
// Konfigurasi AI (frontend-safe — tidak ada API key di sini)
//
// API key Gemini & LangFlow disimpan sebagai environment variable
// di SERVER (Vercel / .env lokal) dan hanya diakses oleh:
//   - api/chat.js     → proxy Gemini chat
//   - api/ocr.js      → proxy Gemini Vision OCR
//   - api/langflow.js → proxy LangFlow Desktop
//
// Frontend hanya perlu tahu MODE yang dipakai.
// ─────────────────────────────────────────────────────────────

// Mode: 'langflow-first' | 'gemini-only'
// Set ke 'gemini-only' untuk deployment online (panitia bisa nilai mandiri)
// Set ke 'langflow-first' saat demo live dengan LangFlow Desktop aktif
export const AI_MODE = import.meta.env.VITE_AI_MODE ?? 'gemini-only'
