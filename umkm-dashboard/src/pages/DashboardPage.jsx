import { useState } from 'react'
import SummaryCards from '../components/SummaryCards'
import FinancialCards from '../components/FinancialCards'
import StockCharts from '../components/StockCharts'
import ActionTable from '../components/ActionTable'
import AgentChatWidget from '../components/AgentChatWidget'
import AgentInsightPanel from '../components/AgentInsightPanel'
import AlertBanner from '../components/AlertBanner'
import LowStockAlert from '../components/LowStockAlert'
import AddProductModal from '../components/AddProductModal'
import OcrFakturModal from '../components/OcrFakturModal'
import PemasokPage from './PemasokPage'
import POSPage from './POSPage'
import SettingsPage from './SettingsPage'
import ActivityLogPage from './ActivityLogPage'
import ProfilePage from './ProfilePage'
import LoginPage from './LoginPage'
import { useAuth } from '../hooks/useAuth'
import { useInventory } from '../hooks/useInventory'
import { usePemasok } from '../hooks/usePemasok'
import { useActivityLog } from '../hooks/useActivityLog'
import { getSupplierIdForCategory } from '../utils/supplierLookup'
import { canAccessPage, getHomePage, ROLE } from '../config/permissions'
import {
  LayoutDashboard, ShoppingBag, LogOut, PackagePlus,
  Truck, Users, MonitorSmartphone, ClipboardList, Settings2, Info,
} from 'lucide-react'

const ROLE_COLOR = {
  [ROLE.CASHIER]: 'bg-emerald-100 text-emerald-700',
  [ROLE.OWNER]:   'bg-purple-100 text-purple-700',
}
const ROLE_LABEL = {
  [ROLE.CASHIER]: 'Kasir',
  [ROLE.OWNER]: 'Pemilik',
}

export default function App() {
  const { currentUser, login, logout } = useAuth()
  const { items, categories, addItem, receiveMany, deleteItem, deleteMany, reduceStock } = useInventory()
  const { pemasokList, addPemasok, deletePemasok, poList, addPO, updatePOStatus, deletePO } = usePemasok()
  const { logs, addLog, clearLogs } = useActivityLog()

  const [requestedPage, setRequestedPage] = useState(() => getHomePage(currentUser?.role))
  const activePage = canAccessPage(currentUser?.role, requestedPage)
    ? requestedPage
    : getHomePage(currentUser?.role)
  const navigateToPage = (page) => {
    if (canAccessPage(currentUser?.role, page)) setRequestedPage(page)
  }
  const [promoProduct, setPromoProduct] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showOcrModal, setShowOcrModal] = useState(false)
  const [poProduct, setPOProduct]       = useState(null)
  const [clearConfirm, setClearConfirm] = useState(false)

  // Pengaturan toko — disimpan di localStorage agar persisten
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('smart_retail_settings') ?? '{}') }
    catch { return {} }
  })
  function saveSettings(next) {
    const merged = { ...settings, ...next }
    setSettings(merged)
    localStorage.setItem('smart_retail_settings', JSON.stringify(merged))
  }

  if (!currentUser) return <LoginPage onLogin={(u, p) => {
    const signedInUser = login(u, p)
    if (signedInUser) {
      setRequestedPage(getHomePage(signedInUser.role))
      // login event will be logged after re-render; fire via timeout
      setTimeout(() => addLog('LOGIN', u, `Login berhasil sebagai pengguna "${u}"`), 0)
    }
    return Boolean(signedInUser)
  }} />

  /* ── logged wrappers ── */
  function loggedAddItem(product) {
    addItem(product)
    addLog('TAMBAH_PRODUK', currentUser.name,
      `Tambah produk baru: "${product.nama}" | Stok: ${product.stok} | Harga Jual: Rp ${Number(product.hargaJual).toLocaleString('id-ID')} | HPP: Rp ${Number(product.hpp).toLocaleString('id-ID')}`)
  }

  function loggedAddMany(products) {
    receiveMany(products.map(product => ({
      ...product,
      supplierId: product.supplierId ?? getSupplierIdForCategory(product.kategori, pemasokList),
    })))
    addLog('TAMBAH_OCR', currentUser.name,
      `OCR Faktur: ${products.length} baris barang diterima — ${products.map(p => `"${p.nama}"`).join(', ')}`)
  }

  function loggedDeleteItem(id) {
    const p = items.find(i => i.id === id)
    deleteItem(id)
    addLog('HAPUS_PRODUK', currentUser.name,
      `Hapus produk: "${p?.nama ?? id}" | Stok saat hapus: ${p?.stok ?? '?'}`)
  }

  function loggedDeleteMany(ids) {
    const names = ids.map(id => items.find(i => i.id === id)?.nama ?? id)
    deleteMany(ids)
    addLog('HAPUS_BANYAK', currentUser.name,
      `Hapus ${ids.length} produk sekaligus: ${names.map(n => `"${n}"`).join(', ')}`)
  }

  function loggedReduceStock(id, qty) {
    const p = items.find(i => i.id === id)
    reduceStock(id, qty)
    addLog('KURANGI_STOK', currentUser.name,
      `Stok berkurang via POS: "${p?.nama ?? id}" −${qty} pcs (sisa: ${Math.max(0, (p?.stok ?? qty) - qty)})`)
  }

  function loggedPOSCheckout(cartSnapshot, payMethod, total) {
    const itemList = cartSnapshot.map(c => `${c.nama} ×${c.qty}`).join(', ')
    addLog('TRANSAKSI_POS', currentUser.name,
      `Transaksi POS selesai | Total: Rp ${total.toLocaleString('id-ID')} | Metode: ${payMethod} | Produk: ${itemList}`)
  }

  function loggedAddPO(po) {
    addPO(po)
    addLog('BUAT_PO', currentUser.name,
      `Buat PO baru ke pemasok "${po.pemasok ?? po.namaP ?? '?'}" | Produk: "${po.produk ?? po.namaProduk ?? '?'}" | Qty: ${po.qty ?? po.jumlah ?? '?'}`)
  }

  function loggedUpdatePOStatus(id, status) {
    const po = poList.find(p => p.id === id)
    updatePOStatus(id, status)
    addLog('UPDATE_PO', currentUser.name,
      `Status PO #${id} (${po?.produk ?? po?.namaProduk ?? '?'}) diubah → "${status}"`)
  }

  function loggedDeletePO(id) {
    const po = poList.find(p => p.id === id)
    deletePO(id)
    addLog('HAPUS_PO', currentUser.name,
      `Hapus PO #${id} — produk: "${po?.produk ?? po?.namaProduk ?? '?'}"`)
  }

  function loggedPromo(product) {
    setPromoProduct(product)
    addLog('BUAT_PROMO', currentUser.name,
      `Buat promo AI untuk: "${product.nama}" | Status: ${product.expired ? `Expired ${product.expired}` : 'Dead-Stock'} | Stok: ${product.stok}`)
  }

  function loggedLogout() {
    addLog('LOGOUT', currentUser.name, `Pengguna "${currentUser.name}" logout dari sistem`)
    logout()
  }

  /* ── Header title ── */
  const PAGE_TITLE = {
    dashboard: 'Dashboard Inventaris',
    pemasok:   'Pemasok & Purchase Order',
    pos:       'Point of Sale (POS)',
    log:       'Log Aktivitas Sistem',
    settings:  currentUser.role === ROLE.CASHIER ? 'Pengaturan Printer' : 'Pengaturan',
    profile:   'Profil Aplikasi',
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ══ Sidebar ═════════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 shadow-sm flex-shrink-0">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Smart Retail AI</p>
              <p className="text-xs text-gray-400">UMKM Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">

          {/* POS — utama, tampil pertama untuk Kasir */}
          <button
            onClick={() => navigateToPage('pos')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors
              ${activePage === 'pos' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <MonitorSmartphone size={16} />
            Point of Sale
          </button>

          {/* Dashboard — hanya Pemilik */}
          {currentUser.role === ROLE.OWNER && (
            <button
              onClick={() => navigateToPage('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors
                ${activePage === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>
          )}

          {/* Pemasok — hanya Pemilik */}
          {currentUser.role === ROLE.OWNER && (
            <button
              onClick={() => navigateToPage('pemasok')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors
                ${activePage === 'pemasok' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Truck size={16} />
              Pemasok & PO
            </button>
          )}

          {/* Log Aktivitas — hanya Pemilik */}
          {currentUser.role === ROLE.OWNER && (
            <button
              onClick={() => navigateToPage('log')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors
                ${activePage === 'log' ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <ClipboardList size={16} />
              <span className="flex-1 text-left">Log Aktivitas</span>
              {logs.length > 0 && (
                <span className="text-xs bg-gray-200 text-gray-600 font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {logs.length}
                </span>
              )}
            </button>
          )}

          {/* Tambah Produk — hanya Pemilik */}
          {currentUser.role === ROLE.OWNER && (
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-bold transition-colors"
            >
              <PackagePlus size={16} />
              Tambah Produk
            </button>
          )}

          {/* divider */}
          <div className="border-t border-gray-100 my-2" />

          {/* Pengaturan — semua role */}
          <button
            onClick={() => navigateToPage('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors
              ${activePage === 'settings' ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Settings2 size={16} />
            {currentUser.role === ROLE.CASHIER ? 'Pengaturan Printer' : 'Pengaturan'}
          </button>

          {currentUser.role === ROLE.OWNER && (
            <button
              onClick={() => navigateToPage('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors
                ${activePage === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Info size={16} />
              Profil Aplikasi
            </button>
          )}
        </nav>

        {/* User info + Logout */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{currentUser.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{currentUser.name}</p>
              <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLOR[currentUser.role] ?? 'bg-gray-100 text-gray-600'}`}>
                {ROLE_LABEL[currentUser.role] ?? currentUser.role}
              </span>
            </div>
          </div>
          <button
            onClick={loggedLogout}
            className="mt-2 w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
          >
            <LogOut size={13} />
            Keluar
          </button>
        </div>
      </aside>

      {/* ══ Main ════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-800">
              {PAGE_TITLE[activePage] ?? 'Dashboard'}
            </h1>
            <p className="text-xs text-gray-400">Periode: Oktober 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-gray-500">AI Aktif</span>
            </div>
            {/* Mobile user badge */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 lg:hidden">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{currentUser.name.charAt(0)}</span>
              </div>
              <span className="text-xs font-medium text-gray-700">{currentUser.name}</span>
              <button onClick={loggedLogout} className="text-gray-400 hover:text-red-500 transition-colors ml-1">
                <LogOut size={13} />
              </button>
            </div>
            {/* Desktop user badge */}
            <div className="hidden lg:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{currentUser.name.charAt(0)}</span>
              </div>
              <span className="text-xs font-medium text-gray-700">{currentUser.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLOR[currentUser.role] ?? 'bg-gray-100 text-gray-600'}`}>
                {ROLE_LABEL[currentUser.role] ?? currentUser.role}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={`flex-1 p-6 overflow-auto ${activePage === 'pos' ? 'flex flex-col' : 'space-y-6'}`}>

          {/* ── DASHBOARD ── */}
          {activePage === 'dashboard' && (
            <>
              <AlertBanner items={items} />

              <section>
                <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">AI Business Optimizer</h2>
                <AgentInsightPanel items={items} />
              </section>

              <LowStockAlert
                items={items}
                onCreatePO={(product) => { setPOProduct(product); navigateToPage('pemasok') }}
              />

              <section>
                <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Ringkasan Inventaris</h2>
                <SummaryCards items={items} />
              </section>

              <section>
                <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Ringkasan Finansial</h2>
                <FinancialCards items={items} />
              </section>

              <section>
                <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Analisis Visual</h2>
                <StockCharts items={items} />
              </section>

              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Data Inventaris</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigateToPage('pemasok')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      <Users size={13} />
                      Kelola Pemasok
                    </button>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <PackagePlus size={13} />
                      Tambah Produk
                    </button>
                  </div>
                </div>
                <ActionTable
                  items={items}
                  categories={categories}
                  onCreatePromo={loggedPromo}
                  onDelete={loggedDeleteItem}
                  onDeleteMany={loggedDeleteMany}
                  onOpenOcr={() => setShowOcrModal(true)}
                />
              </section>
            </>
          )}

          {/* ── PEMASOK & PO ── */}
          {activePage === 'pemasok' && (
            <PemasokPage
              pemasokList={pemasokList}
              products={items}
              poList={poList}
              addPemasok={addPemasok}
              deletePemasok={deletePemasok}
              addPO={loggedAddPO}
              updatePOStatus={loggedUpdatePOStatus}
              deletePO={loggedDeletePO}
              defaultPOProduct={poProduct}
              onDefaultPOClear={() => setPOProduct(null)}
            />
          )}

          {/* ── POINT OF SALE ── */}
          {activePage === 'pos' && (
            <POSPage
              items={items}
              onReduceStock={loggedReduceStock}
              onCheckoutLog={loggedPOSCheckout}
              cashierName={currentUser.name}
              storeName={settings.storeName}
            />
          )}

          {/* ── LOG AKTIVITAS ── */}
          {activePage === 'log' && (
            <ActivityLogPage
              logs={logs}
              onClear={() => setClearConfirm(true)}
            />
          )}

          {/* ── PENGATURAN ── */}
          {activePage === 'settings' && (
            <SettingsPage
              settings={settings}
              onSave={saveSettings}
              currentUser={currentUser}
            />
          )}

          {/* ── PROFIL APLIKASI ── */}
          {activePage === 'profile' && <ProfilePage />}
        </main>
      </div>

      {/* Floating Chat Widget */}
      {currentUser.role === ROLE.OWNER && (
        <AgentChatWidget
          promoProduct={promoProduct}
          onPromoClear={() => setPromoProduct(null)}
        />
      )}

      {/* Modal Tambah Produk */}
      {showAddModal && (
        <AddProductModal
          pemasokList={pemasokList}
          onAdd={loggedAddItem}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Modal OCR Faktur */}
      {showOcrModal && (
        <OcrFakturModal
          onAddMany={loggedAddMany}
          onClose={() => setShowOcrModal(false)}
        />
      )}

      {/* Dialog konfirmasi clear log */}
      {clearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-xl">
                <ClipboardList size={18} className="text-red-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Hapus Semua Log?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Semua <span className="font-semibold text-gray-700">{logs.length} entri log</span> akan dihapus secara permanen dari sesi ini.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setClearConfirm(false)}
                className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => { clearLogs(); setClearConfirm(false) }}
                className="flex-1 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                Hapus Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
