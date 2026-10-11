// Data pemasok awal (mock)
export const pemasokInitial = [
  { id: 1, nama: 'CV Sumber Makmur',     kontak: '0812-3456-7890', email: 'sumber@makmur.id',  alamat: 'Jl. Raya Bogor No. 12, Jakarta',    kategori: 'Makanan Pokok' },
  { id: 2, nama: 'PT Maju Bersama',      kontak: '0821-9876-5432', email: 'maju@bersama.co.id', alamat: 'Jl. Sudirman No. 45, Bandung',      kategori: 'Minuman' },
  { id: 3, nama: 'UD Berkah Jaya',       kontak: '0856-1234-5678', email: 'berkah@jaya.com',    alamat: 'Jl. Pahlawan No. 8, Surabaya',      kategori: 'Kebersihan' },
  { id: 4, nama: 'Toko Snack Sejahtera', kontak: '0878-8765-4321', email: 'snack@sejahtera.id', alamat: 'Jl. Veteran No. 33, Yogyakarta',    kategori: 'Snack & Susu' },
  { id: 5, nama: 'CV Bumbu Nusantara',   kontak: '0813-5555-6666', email: 'bumbu@nusantara.id', alamat: 'Jl. Gatot Subroto No. 21, Semarang', kategori: 'Bumbu & Saus' },
  { id: 6, nama: 'UD Aneka Niaga',       kontak: '0812-1111-2222', email: 'aneka@niaga.id',     alamat: 'Jl. Diponegoro No. 10, Jakarta',     kategori: 'Lainnya' },
]

// Status PO
export const PO_STATUS = {
  draft:    { label: 'Draft',      bg: 'bg-gray-100',   text: 'text-gray-600'   },
  dikirim:  { label: 'Dikirim',    bg: 'bg-blue-100',   text: 'text-blue-700'   },
  diterima: { label: 'Diterima',   bg: 'bg-emerald-100',text: 'text-emerald-700' },
  dibatal:  { label: 'Dibatalkan', bg: 'bg-red-100',    text: 'text-red-700'    },
}

// Data PO awal (mock)
export const poInitial = [
  { id: 'PO-001', tanggal: '2026-10-01', pemasokId: 1, pemasokNama: 'CV Sumber Makmur',     items: [{ nama: 'Beras Premium 5kg', qty: 30, hpp: 62000 }],  total: 1860000, status: 'diterima', catatan: '' },
  { id: 'PO-002', tanggal: '2026-10-03', pemasokId: 2, pemasokNama: 'PT Maju Bersama',      items: [{ nama: 'Air Mineral 600ml',  qty: 100, hpp: 2500 }, { nama: 'Kopi Bubuk 165g', qty: 20, hpp: 11000 }], total: 470000, status: 'dikirim',  catatan: 'Estimasi tiba 5 Okt' },
  { id: 'PO-003', tanggal: '2026-10-05', pemasokId: 3, pemasokNama: 'UD Berkah Jaya',       items: [{ nama: 'Deterjen Bubuk 800g', qty: 20, hpp: 18000 }], total: 360000, status: 'draft',    catatan: '' },
]
