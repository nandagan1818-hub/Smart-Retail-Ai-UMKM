// Schema produk (disederhanakan untuk toko kecil / kelontong):
// { id, nama, kategori, stok, hargaJual, hpp, stokMin, expired }
// - terjualPerBulan dihapus (tidak relevan untuk POS tatap muka sederhana)
// - estimasiLaku: perkiraan kasar laku/bulan, hanya untuk kalkulasi dead-stock alert
// - stokMin: batas minimum sebelum muncul alert reorder

export const inventory = [
  { id: 1,  nama: 'Susu UHT Cokelat 250ml',      kategori: 'Minuman',       supplierId: 2, stok: 35,  hargaJual: 7000,  hpp: 5000,  stokMin: 20, estimasiLaku: 45,  expired: '2026-10-30' },
  { id: 2,  nama: 'Susu UHT Full Cream 1L',       kategori: 'Minuman',       supplierId: 2, stok: 18,  hargaJual: 19500, hpp: 15000, stokMin: 20, estimasiLaku: 20,  expired: '2026-11-15' },
  { id: 3,  nama: 'Kecap Manis 520ml',            kategori: 'Bumbu & Saus',  supplierId: 5, stok: 50,  hargaJual: 22000, hpp: 16000, stokMin: 15, estimasiLaku: 12,  expired: '2027-08-10' },
  { id: 4,  nama: 'Saus Sambal 335ml',            kategori: 'Bumbu & Saus',  supplierId: 5, stok: 40,  hargaJual: 14500, hpp: 10000, stokMin: 15, estimasiLaku: 18,  expired: '2027-07-05' },
  { id: 5,  nama: 'Mie Instan Goreng',            kategori: 'Makanan Pokok', supplierId: 1, stok: 200, hargaJual: 3500,  hpp: 2500,  stokMin: 50, estimasiLaku: 180, expired: '2027-05-20' },
  { id: 6,  nama: 'Mie Instan Kuah Soto',         kategori: 'Makanan Pokok', supplierId: 1, stok: 150, hargaJual: 3300,  hpp: 2300,  stokMin: 50, estimasiLaku: 110, expired: '2027-06-18' },
  { id: 7,  nama: 'Minyak Goreng 2L',             kategori: 'Makanan Pokok', supplierId: 1, stok: 45,  hargaJual: 34000, hpp: 28000, stokMin: 20, estimasiLaku: 65,  expired: '2027-12-12' },
  { id: 8,  nama: 'Beras Premium 5kg',           kategori: 'Makanan Pokok', supplierId: 1, stok: 20,  hargaJual: 75000, hpp: 62000, stokMin: 10, estimasiLaku: 25,  expired: '2027-10-18' },
  { id: 9,  nama: 'Gula Pasir 1kg',              kategori: 'Makanan Pokok', supplierId: 1, stok: 60,  hargaJual: 17500, hpp: 14000, stokMin: 30, estimasiLaku: 70,  expired: '2028-01-14' },
  { id: 10, nama: 'Kopi Bubuk 165g',             kategori: 'Minuman',       supplierId: 2, stok: 30,  hargaJual: 15000, hpp: 11000, stokMin: 15, estimasiLaku: 35,  expired: '2027-09-05' },
  { id: 11, nama: 'Teh Celup 25s',               kategori: 'Minuman',       supplierId: 2, stok: 40,  hargaJual: 8500,  hpp: 6000,  stokMin: 15, estimasiLaku: 22,  expired: '2027-03-30' },
  { id: 12, nama: 'Roti Tawar Kupas',            kategori: 'Snack & Susu',  supplierId: 4, stok: 12,  hargaJual: 16000, hpp: 12000, stokMin: 15, estimasiLaku: 30,  expired: '2026-10-08' },
  { id: 13, nama: 'Yogurt Drink 250ml',          kategori: 'Minuman',       supplierId: 2, stok: 15,  hargaJual: 10000, hpp: 7500,  stokMin: 20, estimasiLaku: 25,  expired: '2026-10-22' },
  { id: 14, nama: 'Air Mineral 600ml',           kategori: 'Minuman',       supplierId: 2, stok: 120, hargaJual: 4000,  hpp: 2500,  stokMin: 50, estimasiLaku: 150, expired: '2028-06-01' },
  { id: 15, nama: 'Biskuit Cokelat 120g',         kategori: 'Snack & Susu',  supplierId: 4, stok: 35,  hargaJual: 9500,  hpp: 7000,  stokMin: 20, estimasiLaku: 40,  expired: '2027-02-10' },
  { id: 16, nama: 'Margarin 200g',               kategori: 'Makanan Pokok', supplierId: 1, stok: 25,  hargaJual: 9000,  hpp: 7000,  stokMin: 10, estimasiLaku: 16,  expired: '2027-02-28' },
  { id: 17, nama: 'Keju Olahan 160g',            kategori: 'Snack & Susu',  supplierId: 4, stok: 18,  hargaJual: 21000, hpp: 16000, stokMin: 10, estimasiLaku: 14,  expired: '2027-04-14' },
  { id: 18, nama: 'Sosis Sapi Siap Makan',        kategori: 'Snack & Susu',  supplierId: 4, stok: 40,  hargaJual: 8000,  hpp: 6000,  stokMin: 20, estimasiLaku: 50,  expired: '2026-11-10' },
  { id: 19, nama: 'Sabun Mandi Cair 450ml',       kategori: 'Kebersihan',    supplierId: 3, stok: 25,  hargaJual: 24000, hpp: 18000, stokMin: 10, estimasiLaku: 18,  expired: '2028-07-15' },
  { id: 20, nama: 'Shampoo Anti Ketombe 160ml',   kategori: 'Kebersihan',    supplierId: 3, stok: 14,  hargaJual: 28500, hpp: 21000, stokMin: 10, estimasiLaku: 12,  expired: '2028-08-01' },
  { id: 21, nama: 'Pasta Gigi 190g',              kategori: 'Kebersihan',    supplierId: 3, stok: 32,  hargaJual: 16500, hpp: 12000, stokMin: 10, estimasiLaku: 22,  expired: '2028-11-19' },
  { id: 22, nama: 'Sabun Cuci Tangan 400ml',      kategori: 'Kebersihan',    supplierId: 3, stok: 22,  hargaJual: 19000, hpp: 14000, stokMin: 10, estimasiLaku: 10,  expired: '2028-12-04' },
  { id: 23, nama: 'Deterjen Bubuk 800g',          kategori: 'Kebersihan',    supplierId: 3, stok: 40,  hargaJual: 23500, hpp: 18000, stokMin: 15, estimasiLaku: 30,  expired: null },
  { id: 24, nama: 'Pembersih Lantai 780ml',       kategori: 'Kebersihan',    supplierId: 3, stok: 28,  hargaJual: 15500, hpp: 11000, stokMin: 10, estimasiLaku: 20,  expired: null },
  { id: 25, nama: 'Sabun Cuci Piring 680ml',      kategori: 'Kebersihan',    supplierId: 3, stok: 55,  hargaJual: 13500, hpp: 9500,  stokMin: 20, estimasiLaku: 45,  expired: null },
  { id: 26, nama: 'Tisu Wajah 250s',              kategori: 'Kebersihan',    supplierId: 3, stok: 35,  hargaJual: 14000, hpp: 10000, stokMin: 15, estimasiLaku: 28,  expired: null },
  { id: 27, nama: 'Baterai AA (Isi 4)',           kategori: 'Lainnya',       supplierId: 6, stok: 25,  hargaJual: 22000, hpp: 16000, stokMin: 10, estimasiLaku: 8,   expired: null },
]

export const CATEGORIES = ['Semua', ...new Set(inventory.map(p => p.kategori))]
