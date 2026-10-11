import { useState, useCallback } from 'react'

// Kategori tindakan
export const LOG_ACTIONS = {
  LOGIN:          { label: 'Login',              color: 'text-blue-700 bg-blue-50 border-blue-200'     },
  LOGOUT:         { label: 'Logout',             color: 'text-gray-700 bg-gray-50 border-gray-200'     },
  TAMBAH_PRODUK:  { label: 'Tambah Produk',      color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  TAMBAH_OCR:     { label: 'OCR Faktur',         color: 'text-violet-700 bg-violet-50 border-violet-200'   },
  HAPUS_PRODUK:   { label: 'Hapus Produk',       color: 'text-red-700 bg-red-50 border-red-200'        },
  HAPUS_BANYAK:   { label: 'Hapus Banyak',       color: 'text-red-700 bg-red-50 border-red-200'        },
  TRANSAKSI_POS:  { label: 'Transaksi POS',      color: 'text-amber-700 bg-amber-50 border-amber-200'  },
  KURANGI_STOK:   { label: 'Kurangi Stok',       color: 'text-orange-700 bg-orange-50 border-orange-200'  },
  BUAT_PO:        { label: 'Buat PO',            color: 'text-indigo-700 bg-indigo-50 border-indigo-200'  },
  UPDATE_PO:      { label: 'Update Status PO',   color: 'text-cyan-700 bg-cyan-50 border-cyan-200'     },
  HAPUS_PO:       { label: 'Hapus PO',           color: 'text-red-700 bg-red-50 border-red-200'        },
  BUAT_PROMO:     { label: 'Buat Promo AI',      color: 'text-pink-700 bg-pink-50 border-pink-200'     },
  EXPORT_CSV:     { label: 'Export CSV',         color: 'text-teal-700 bg-teal-50 border-teal-200'     },
}

function nowFormatted() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function useActivityLog() {
  const [logs, setLogs] = useState([])

  const addLog = useCallback((action, userName, detail) => {
    const entry = {
      id:        Date.now() + Math.random(),
      waktu:     nowFormatted(),
      pengguna:  userName,
      tindakan:  action,
      detail,
    }
    setLogs(prev => [entry, ...prev])   // newest first
  }, [])

  const clearLogs = useCallback(() => setLogs([]), [])

  return { logs, addLog, clearLogs }
}
