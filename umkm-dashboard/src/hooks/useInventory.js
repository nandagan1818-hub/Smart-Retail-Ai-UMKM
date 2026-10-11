import { useState } from 'react'
import { inventory as initialData } from '../data/inventory'
import { calculateMovingAverageHpp } from '../utils/accounting'

export function useInventory() {
  const [items, setItems] = useState(initialData)

  const categories = ['Semua', ...new Set(items.map(p => p.kategori))]

  function addItem(product) {
    const newId = items.length > 0 ? Math.max(...items.map(p => p.id)) + 1 : 1
    setItems(prev => [...prev, { ...product, id: newId }])
  }

  function addMany(products) {
    setItems(prev => {
      let maxId = prev.length > 0 ? Math.max(...prev.map(p => p.id)) : 0
      const newItems = products.map(p => ({ ...p, id: ++maxId, stokMin: p.stokMin ?? 5 }))
      return [...prev, ...newItems]
    })
  }

  function receiveMany(products) {
    setItems(prev => {
      const next = [...prev]
      let maxId = prev.length > 0 ? Math.max(...prev.map(p => p.id)) : 0

      products.forEach(product => {
        const productName = product.nama.trim().toLocaleLowerCase('id-ID')
        const existingIndex = next.findIndex(
          item => item.nama.trim().toLocaleLowerCase('id-ID') === productName
        )

        if (existingIndex === -1) {
          next.push({ ...product, id: ++maxId, stokMin: product.stokMin ?? 5 })
          return
        }

        const existing = next[existingIndex]
        next[existingIndex] = {
          ...existing,
          stok: existing.stok + product.stok,
          hpp: calculateMovingAverageHpp(
            { stokSisa: existing.stok, hppLama: existing.hpp },
            { jumlahMasuk: product.stok, hargaBeliBaru: product.hpp },
          ),
        }
      })

      return next
    })
  }

  function deleteItem(id) {
    setItems(prev => prev.filter(p => p.id !== id))
  }

  function deleteMany(ids) {
    const set = new Set(ids)
    setItems(prev => prev.filter(p => !set.has(p.id)))
  }

  function reduceStock(id, qty) {
    setItems(prev =>
      prev.map(p => p.id === id ? { ...p, stok: Math.max(0, p.stok - qty) } : p)
    )
  }

  return { items, categories, addItem, addMany, receiveMany, deleteItem, deleteMany, reduceStock }
}
