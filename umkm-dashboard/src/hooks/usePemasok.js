import { useState } from 'react'
import { pemasokInitial, poInitial } from '../data/pemasok'

export function usePemasok() {
  const [pemasokList, setPemasokList] = useState(pemasokInitial)
  const [poList, setPoList]           = useState(poInitial)

  // ── Pemasok ──────────────────────────────────────────────────
  function addPemasok(data) {
    const newId = pemasokList.length > 0 ? Math.max(...pemasokList.map(p => p.id)) + 1 : 1
    setPemasokList(prev => [...prev, { ...data, id: newId }])
  }

  function deletePemasok(id) {
    setPemasokList(prev => prev.filter(p => p.id !== id))
  }

  // ── Purchase Order ────────────────────────────────────────────
  function addPO(data) {
    const newId = `PO-${String(poList.length + 1).padStart(3, '0')}`
    const total = data.items.reduce((s, i) => s + i.qty * i.hpp, 0)
    setPoList(prev => [...prev, { ...data, id: newId, total, status: 'draft' }])
  }

  function updatePOStatus(id, status) {
    setPoList(prev => prev.map(po => po.id === id ? { ...po, status } : po))
  }

  function deletePO(id) {
    setPoList(prev => prev.filter(po => po.id !== id))
  }

  return { pemasokList, addPemasok, deletePemasok, poList, addPO, updatePOStatus, deletePO }
}
