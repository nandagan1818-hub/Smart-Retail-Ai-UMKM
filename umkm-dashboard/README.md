# Smart Retail AI — Dashboard Inventaris UMKM

Dashboard manajemen inventaris berbasis AI untuk UMKM. Dibangun dengan React + Tailwind CSS + Recharts, terhubung ke LangFlow untuk fitur Chat AI.

---

## 🚀 Cara Menjalankan

```bash
# 1. Install dependencies
npm install

# 2. Jalankan dev server
npm run dev

# 3. Buka di browser
# http://localhost:5173
```

> **Pastikan LangFlow Desktop sudah berjalan** di `localhost:7860` sebelum menggunakan fitur Chat AI.

---

## 📁 Struktur Folder

```
src/
│
├── App.jsx                        # Entry point — hanya render DashboardPage
├── main.jsx                       # Root React, mount ke #root
├── index.css                      # Global CSS (Tailwind import)
│
├── pages/                         # Halaman-halaman utama
│   ├── DashboardPage.jsx          # Halaman dashboard utama (layout + routing login)
│   └── LoginPage.jsx              # Halaman login dengan form & akun demo
│
├── components/                    # Komponen UI reusable
│   ├── SummaryCards.jsx           # 4 KPI Cards (Kerugian, Dead-Stock, Expired, Health Score)
│   ├── StockCharts.jsx            # Bar Chart & Donut Chart (Recharts)
│   ├── ActionTable.jsx            # Tabel inventaris (search, filter, export CSV, buat promo)
│   ├── AgentChatWidget.jsx        # Floating chat AI (terhubung ke LangFlow)
│   └── AlertBanner.jsx            # Banner peringatan produk expired/hampir expired
│
├── data/                          # Data statis / mock
│   └── inventory.js               # 27 produk inventaris toko (nama, stok, harga, expired)
│
├── utils/                         # Fungsi kalkulasi & helper
│   └── kpi.js                     # Kalkulasi KPI: potensi kerugian, dead-stock, health score
│
├── hooks/                         # Custom React hooks
│   └── useAuth.js                 # Hook autentikasi (login, logout, session)
│
└── config/                        # Konfigurasi konstan
    ├── auth.js                    # Daftar akun & session key
    └── langflow.js                # URL, Flow ID, dan API Key LangFlow
```

---

## 🔑 Akun Login

| Username  | Password     | Role    |
|-----------|-------------|---------|
| `admin`   | `admin123`   | Admin   |
| `kasir`   | `kasir123`   | Kasir   |
| `pemilik` | `pemilik123` | Pemilik |

---

## 🤖 Konfigurasi LangFlow

Edit file [`src/config/langflow.js`](src/config/langflow.js):

```js
export const LANGFLOW_BASE_URL = '/langflow-api'        // proxy ke localhost:7860
export const LANGFLOW_FLOW_ID  = 'ecbe443a-...'         // ID flow di LangFlow Desktop
export const LANGFLOW_API_KEY  = 'sk-...'               // API Key LangFlow
```

---

## ✨ Fitur Dashboard

| Fitur | Komponen | Deskripsi |
|-------|----------|-----------|
| Login & Logout | `LoginPage`, `useAuth` | Autentikasi session-based |
| 4 KPI Cards | `SummaryCards` | Potensi Kerugian, Dead-Stock, Expired, Health Score |
| Bar Chart | `StockCharts` | Stok vs Terjual per kategori |
| Donut Chart | `StockCharts` | Distribusi status produk |
| Tabel Inventaris | `ActionTable` | Search, filter kategori, status badge |
| Export CSV | `ActionTable` | Download data sesuai filter aktif |
| OCR Faktur & Moving Average | `OcrFakturModal` | Barang yang dipindai menambah stok produk yang sudah ada dan menghitung ulang HPP dengan metode rata-rata bergerak |
| Tombol Buat Promo | `ActionTable` | Kirim produk ke Chat AI |
| Banner Alert | `AlertBanner` | Peringatan produk expired/hampir expired |
| Chat AI | `AgentChatWidget` | Floating chat terhubung ke LangFlow + Gemini |
| Copy Teks Promo | `AgentChatWidget` | Hover bubble AI → klik copy |

---

## 🛠️ Tech Stack

| Library | Kegunaan |
|---------|----------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS v4 | Styling |
| Recharts | Bar Chart & Donut Chart |
| Axios | HTTP request ke LangFlow |
| Lucide React | Ikon |
| LangFlow | AI backend (flow Gemini) |
