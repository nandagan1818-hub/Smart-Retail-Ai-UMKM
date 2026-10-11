export function calculateMovingAverageHpp(
  { stokSisa, hppLama },
  { jumlahMasuk, hargaBeliBaru },
) {
  const values = { stokSisa, hppLama, jumlahMasuk, hargaBeliBaru }

  for (const [name, value] of Object.entries(values)) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError(`${name} harus berupa angka yang valid.`)
    }
    if (value < 0) {
      throw new RangeError(`${name} tidak boleh negatif.`)
    }
  }

  const totalStok = stokSisa + jumlahMasuk
  if (totalStok === 0) return hppLama

  return ((stokSisa * hppLama) + (jumlahMasuk * hargaBeliBaru)) / totalStok
}
