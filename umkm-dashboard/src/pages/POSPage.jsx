import { useState, useRef } from 'react'
import {
  Search, ShoppingCart, Trash2, Plus, Minus,
  CreditCard, Banknote, Smartphone, Printer, Mail,
  CheckCircle2, X, ScanBarcode, PackageX, ChevronDown,
} from 'lucide-react'

/* ─── helpers ─────────────────────────────────────────── */
function fmtRp(n) {
  if (!n && n !== 0) return 'Rp 0'
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}

function nowStr() {
  const d = new Date()
  return {
    date: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
    time: d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    txId: 'TXN' + d.getTime().toString().slice(-8),
  }
}

const PAYMENT_METHODS = [
  { id: 'cash',    label: 'Tunai',    Icon: Banknote },
  { id: 'card',    label: 'Kartu',    Icon: CreditCard },
  { id: 'ewallet', label: 'E-Wallet', Icon: Smartphone },
]

const QUICK_CASH = [5_000, 10_000, 20_000, 50_000, 100_000, 200_000]

/* ─── ReceiptModal ────────────────────────────────────── */
function ReceiptModal({ lines, txId, onClose }) {
  function handlePrint() {
    const w = window.open('', '_blank', 'width=420,height=640')
    if (!w) return
    w.document.write(
      `<!DOCTYPE html><html><head><title>Struk ${txId}</title>` +
      `<style>body{margin:0;padding:20px;font-family:monospace;font-size:13px;line-height:1.6}</style></head>` +
      `<body><pre>${lines.join('\n')}</pre><script>window.onload=()=>{window.print();window.close()}</` + `script></body></html>`
    )
    w.document.close()
    w.focus()
  }

  function handleEmail() {
    const body = encodeURIComponent(lines.join('\n'))
    window.location.href = `mailto:?subject=Struk Belanja – ${txId}&body=${body}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">

        {/* success header */}
        <div className="flex items-center justify-between px-6 py-5 bg-emerald-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center">
              <CheckCircle2 size={22} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-base">Transaksi Berhasil!</p>
              <p className="text-emerald-100 text-xs">{txId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* receipt preview */}
        <div className="px-5 py-4 max-h-64 overflow-y-auto bg-gray-50 border-b border-gray-100">
          <pre className="text-xs font-mono text-gray-600 whitespace-pre leading-relaxed">
            {lines.join('\n')}
          </pre>
        </div>

        {/* action buttons — large, thumb-friendly */}
        <div className="px-5 py-5 space-y-3">
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-3 py-4
                       bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                       text-white text-base font-bold rounded-2xl transition-colors"
          >
            <Printer size={20} />
            Cetak Struk
          </button>
          <button
            onClick={handleEmail}
            className="w-full flex items-center justify-center gap-3 py-4
                       bg-gray-100 hover:bg-gray-200 active:bg-gray-300
                       text-gray-700 text-base font-bold rounded-2xl transition-colors"
          >
            <Mail size={20} />
            Kirim E-Receipt
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Tutup & Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── ProductCard ─────────────────────────────────────── */
function ProductCard({ item, inCart, onAdd }) {
  const outOfStock = item.stok <= 0
  const lowStock   = item.stok > 0 && item.stokMin && item.stok <= item.stokMin

  return (
    <button
      onClick={() => !outOfStock && onAdd(item)}
      disabled={outOfStock}
      className={[
        'relative flex flex-col items-start p-3 rounded-2xl border text-left transition-all active:scale-95',
        outOfStock
          ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
          : inCart
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md',
      ].join(' ')}
    >
      {/* qty badge */}
      {inCart && (
        <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-blue-600
                         text-white text-xs font-black flex items-center justify-center shadow-sm z-10">
          {inCart.qty}
        </span>
      )}

      {/* icon area */}
      <div className={[
        'w-full aspect-square rounded-xl mb-2.5 flex items-center justify-center',
        outOfStock ? 'bg-gray-100' : inCart ? 'bg-blue-100' : 'bg-gray-50',
      ].join(' ')}>
        {outOfStock
          ? <PackageX size={24} className="text-gray-300" />
          : <ShoppingCart size={24} className={inCart ? 'text-blue-500' : 'text-gray-300'} />
        }
      </div>

      {/* name */}
      <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mb-1.5 w-full min-h-[2rem]">
        {item.nama}
      </p>

      {/* price */}
      <p className="text-sm font-black text-blue-600 mb-1">{fmtRp(item.hargaJual)}</p>

      {/* stock badge */}
      <span className={[
        'inline-flex items-center text-xs rounded-full px-2 py-0.5 font-semibold',
        outOfStock ? 'bg-red-100 text-red-600'
          : lowStock ? 'bg-amber-100 text-amber-700'
          : 'bg-emerald-50 text-emerald-700',
      ].join(' ')}>
        {outOfStock ? 'Habis' : lowStock ? `Sisa ${item.stok}` : `Stok ${item.stok}`}
      </span>
    </button>
  )
}

/* ─── CartItem row ────────────────────────────────────── */
function CartRow({ item, onInc, onDec, onRemove }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate leading-tight">{item.nama}</p>
        <p className="text-xs text-blue-600 font-bold mt-0.5">{fmtRp(item.hargaJual)}</p>
      </div>
      {/* qty controls — big touch targets */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onDec(item.id)}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300
                     flex items-center justify-center transition-colors"
        >
          <Minus size={13} />
        </button>
        <span className="w-7 text-center text-sm font-black text-gray-800">{item.qty}</span>
        <button
          onClick={() => onInc(item.id)}
          disabled={item.qty >= item.stok}
          className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 active:bg-blue-300
                     text-blue-700 flex items-center justify-center transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus size={13} />
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 active:bg-red-200
                     text-red-400 hover:text-red-600 flex items-center justify-center
                     transition-colors ml-1"
        >
          <Trash2 size={13} />
        </button>
      </div>
      {/* line total */}
      <p className="text-xs font-bold text-gray-700 text-right w-16 shrink-0">
        {fmtRp(item.hargaJual * item.qty)}
      </p>
    </div>
  )
}

/* ─── POSPage (main) ──────────────────────────────────── */
export default function POSPage({ items, onReduceStock, onCheckoutLog, cashierName, storeName }) {
  const [search,      setSearch]      = useState('')
  const [barcode,     setBarcode]     = useState('')
  const [activeCat,   setActiveCat]   = useState('Semua')
  const [cart,        setCart]        = useState([])
  const [payMethod,   setPayMethod]   = useState('cash')
  const [cashInput,   setCashInput]   = useState('')
  const [receiptData, setReceiptData] = useState(null)
  const [barcodeErr,  setBarcodeErr]  = useState(false)
  const [showCart,    setShowCart]    = useState(false)   // mobile cart drawer

  const barcodeRef = useRef(null)
  const searchRef  = useRef(null)

  /* derived */
  const categories = ['Semua', ...new Set(items.map(i => i.kategori))]
  const filtered   = items.filter(item => {
    const matchCat = activeCat === 'Semua' || item.kategori === activeCat
    const q = search.trim().toLowerCase()
    const matchQ = !q || item.nama.toLowerCase().includes(q) || String(item.id).includes(q)
    return matchCat && matchQ
  })

  const subtotal  = cart.reduce((s, c) => s + c.hargaJual * c.qty, 0)
  const cartCount = cart.reduce((s, c) => s + c.qty, 0)
  const cashPaid  = parseInt(cashInput.replace(/\D/g, '') || '0', 10)
  const change    = payMethod === 'cash' ? Math.max(0, cashPaid - subtotal) : 0
  const canPay    = cart.length > 0 && (payMethod !== 'cash' || cashPaid >= subtotal)

  /* cart ops */
  function addToCart(item) {
    if (item.stok <= 0) return
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id)
      if (ex) {
        if (ex.qty >= item.stok) return prev
        return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }

  function incQty(id) {
    const item = items.find(i => i.id === id)
    setCart(prev => prev.map(c => {
      if (c.id !== id) return c
      if (c.qty >= (item?.stok ?? c.qty)) return c
      return { ...c, qty: c.qty + 1 }
    }))
  }

  function decQty(id) {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c).filter(c => c.qty > 0))
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(c => c.id !== id))
  }

  function clearCart() {
    setCart([])
    setCashInput('')
  }

  /* barcode */
  function handleBarcode(e) {
    e.preventDefault()
    const code = barcode.trim()
    if (!code) return
    const found = items.find(i => String(i.id) === code || i.barcode === code)
    if (found) {
      addToCart(found)
      setBarcodeErr(false)
    } else {
      setBarcodeErr(true)
      setTimeout(() => setBarcodeErr(false), 1500)
    }
    setBarcode('')
    barcodeRef.current?.focus()
  }

  /* checkout */
  function handleCheckout() {
    if (!canPay) return
    const snapshot = [...cart]
    snapshot.forEach(c => onReduceStock(c.id, c.qty))

    const { date, time, txId } = nowStr()
    const shop = storeName || 'Smart Retail AI'
    const sep  = '================================'
    const sep2 = '--------------------------------'
    const lines = [
      sep,
      `  ${shop.padStart(Math.floor((32 + shop.length) / 2)).padEnd(32)}`,
      sep,
      `Tanggal : ${date}`,
      `Jam     : ${time}`,
      `No. Tx  : ${txId}`,
      `Kasir   : ${cashierName}`,
      sep2,
      ...snapshot.map(c => {
        const nama  = c.nama.length > 18 ? c.nama.slice(0, 17) + '…' : c.nama
        return `${nama}\n  ${fmtRp(c.hargaJual)} x${c.qty}  = ${fmtRp(c.hargaJual * c.qty)}`
      }),
      sep2,
      `TOTAL      : ${fmtRp(subtotal)}`,
      `Pembayaran : ${PAYMENT_METHODS.find(p => p.id === payMethod)?.label ?? payMethod}`,
      ...(payMethod === 'cash'
        ? [`Bayar      : ${fmtRp(cashPaid)}`, `Kembalian  : ${fmtRp(change)}`]
        : []),
      sep2,
      '  Terima kasih telah berbelanja!  ',
      sep,
    ]

    setReceiptData({ lines, txId })
    onCheckoutLog?.(snapshot, PAYMENT_METHODS.find(p => p.id === payMethod)?.label ?? payMethod, subtotal)
    clearCart()
    setShowCart(false)
    setPayMethod('cash')
  }

  /* ── CART PANEL (shared for desktop right-col + mobile drawer) ── */
  const CartPanel = (
    <div className="flex flex-col h-full">

      {/* cart header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-blue-600" />
          <span className="text-base font-black text-gray-800">Keranjang</span>
          {cartCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-black
                             px-2 py-0.5 rounded-full leading-none min-w-[1.5rem] text-center">
              {cartCount}
            </span>
          )}
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600
                       font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
          >
            <Trash2 size={13} /> Kosongkan
          </button>
        )}
      </div>

      {/* items list */}
      <div className="flex-1 overflow-y-auto px-5 py-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-gray-200 gap-3">
            <ShoppingCart size={44} />
            <p className="text-sm text-gray-300 font-medium">Keranjang kosong</p>
            <p className="text-xs text-gray-300 text-center">
              Ketuk produk di sebelah kiri untuk menambahkan
            </p>
          </div>
        ) : (
          cart.map(item => (
            <CartRow
              key={item.id}
              item={item}
              onInc={incQty}
              onDec={decQty}
              onRemove={removeFromCart}
            />
          ))
        )}
      </div>

      {/* payment panel */}
      <div className="border-t border-gray-100 px-5 pt-4 pb-5 space-y-4">

        {/* subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">Total Belanja</span>
          <span className="text-2xl font-black text-gray-900">{fmtRp(subtotal)}</span>
        </div>

        {/* payment method — large pills */}
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_METHODS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setPayMethod(id); setCashInput('') }}
              className={[
                'flex flex-col items-center py-3 rounded-2xl border-2 text-xs font-bold transition-all',
                payMethod === id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-300',
              ].join(' ')}
            >
              <Icon size={18} className="mb-1" />
              {label}
            </button>
          ))}
        </div>

        {/* cash input */}
        {payMethod === 'cash' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Jumlah Dibayar (Tunai)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={cashInput ? Number(cashInput).toLocaleString('id-ID') : ''}
              onChange={e => setCashInput(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg
                         font-black text-gray-800 focus:outline-none focus:border-blue-400
                         focus:ring-2 focus:ring-blue-100 transition-all"
            />

            {/* kembalian */}
            {cashPaid > 0 && (
              <div className={[
                'flex justify-between text-sm px-1 font-black',
                change >= 0 ? 'text-emerald-600' : 'text-red-500',
              ].join(' ')}>
                <span>Kembalian</span>
                <span>{fmtRp(change)}</span>
              </div>
            )}

            {/* quick cash — thumb-friendly */}
            <div className="flex gap-1.5 flex-wrap">
              {QUICK_CASH.filter(v => v >= subtotal * 0.9 || subtotal === 0).slice(0, 5).map(v => (
                <button
                  key={v}
                  onClick={() => setCashInput(String(v))}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300
                             text-gray-700 rounded-xl font-bold transition-colors"
                >
                  {v >= 1000 ? `${v / 1000}rb` : v}
                </button>
              ))}
              {subtotal > 0 && (
                <button
                  onClick={() => setCashInput(String(subtotal))}
                  className="text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100
                             text-emerald-700 rounded-xl font-bold transition-colors"
                >
                  Uang Pas
                </button>
              )}
            </div>
          </div>
        )}

        {/* CHECKOUT BUTTON — prominent CTA */}
        <button
          onClick={handleCheckout}
          disabled={!canPay}
          className={[
            'w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-3 transition-all',
            canPay
              ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-lg shadow-emerald-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed',
          ].join(' ')}
        >
          <CreditCard size={20} />
          {canPay ? `Bayar ${fmtRp(subtotal)}` : 'Pilih Produk Dulu'}
        </button>
      </div>
    </div>
  )

  /* ── RENDER ── */
  return (
    <>
      {/* ── DESKTOP: two-column ──────────────────────────── */}
      <div className="hidden lg:flex gap-4" style={{ height: 'calc(100vh - 112px)' }}>

        {/* LEFT: catalog */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <SearchBarcodeRow
            search={search} setSearch={setSearch} searchRef={searchRef}
            barcode={barcode} setBarcode={setBarcode} barcodeRef={barcodeRef}
            barcodeErr={barcodeErr} setBarcodeErr={setBarcodeErr}
            handleBarcode={handleBarcode}
          />
          <CategoryPills categories={categories} activeCat={activeCat} setActiveCat={setActiveCat} />
          <ProductGrid filtered={filtered} cart={cart} addToCart={addToCart} />
        </div>

        {/* RIGHT: cart */}
        <div className="w-88 shrink-0 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col"
             style={{ width: '22rem' }}>
          {CartPanel}
        </div>
      </div>

      {/* ── MOBILE: single column + floating cart button ─── */}
      <div className="lg:hidden flex flex-col gap-3 pb-24">
        <SearchBarcodeRow
          search={search} setSearch={setSearch} searchRef={searchRef}
          barcode={barcode} setBarcode={setBarcode} barcodeRef={barcodeRef}
          barcodeErr={barcodeErr} setBarcodeErr={setBarcodeErr}
          handleBarcode={handleBarcode}
        />
        <CategoryPills categories={categories} activeCat={activeCat} setActiveCat={setActiveCat} />
        <ProductGrid filtered={filtered} cart={cart} addToCart={addToCart} />
      </div>

      {/* MOBILE: floating cart button */}
      {!showCart && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={() => setShowCart(true)}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                       text-white font-black rounded-full px-6 py-4 shadow-2xl shadow-blue-400/40
                       transition-all"
          >
            <ShoppingCart size={20} />
            <span>{cartCount > 0 ? `Keranjang (${cartCount})` : 'Keranjang'}</span>
            {subtotal > 0 && <span className="bg-white/20 rounded-full px-2 py-0.5 text-sm">{fmtRp(subtotal)}</span>}
          </button>
        </div>
      )}

      {/* MOBILE: cart bottom drawer */}
      {showCart && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/50">
          <div className="bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* drawer handle */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto" />
            </div>
            <button
              onClick={() => setShowCart(false)}
              className="absolute top-4 right-5 text-gray-400 hover:text-gray-700"
            >
              <ChevronDown size={22} />
            </button>
            <div className="flex-1 overflow-hidden flex flex-col">
              {CartPanel}
            </div>
          </div>
        </div>
      )}

      {/* receipt modal */}
      {receiptData && (
        <ReceiptModal
          lines={receiptData.lines}
          txId={receiptData.txId}
          onClose={() => setReceiptData(null)}
        />
      )}
    </>
  )
}

/* ─── Sub-components ──────────────────────────────────── */
function SearchBarcodeRow({ search, setSearch, searchRef, barcode, setBarcode, barcodeRef, barcodeErr, setBarcodeErr, handleBarcode }) {
  return (
    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
      {/* product search */}
      <div className="relative flex-1 min-w-0">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama produk atau ID…"
          className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl
                     text-sm font-medium focus:outline-none focus:border-blue-400 focus:ring-2
                     focus:ring-blue-100 transition-all"
        />
      </div>

      {/* barcode */}
      <form onSubmit={handleBarcode} className="flex gap-2 shrink-0">
        <div className="relative">
          <ScanBarcode
            size={16}
            className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none
                        ${barcodeErr ? 'text-red-400' : 'text-gray-400'}`}
          />
          <input
            ref={barcodeRef}
            type="text"
            value={barcode}
            onChange={e => { setBarcode(e.target.value); setBarcodeErr(false) }}
            placeholder="Scan barcode…"
            className={`w-40 pl-11 pr-3 py-3 border-2 rounded-2xl text-sm font-medium
                        focus:outline-none focus:ring-2 transition-all
                        ${barcodeErr
                          ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-100'
                          : 'border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-100'}`}
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                     text-white rounded-2xl text-sm font-bold transition-colors"
        >
          Tambah
        </button>
      </form>
    </div>
  )
}

function CategoryPills({ categories, activeCat, setActiveCat }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setActiveCat(cat)}
          className={[
            'px-4 py-1.5 rounded-full text-xs font-bold transition-all border',
            activeCat === cat
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-300',
          ].join(' ')}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

function ProductGrid({ filtered, cart, addToCart }) {
  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-300 gap-2">
        <ShoppingCart size={36} />
        <p className="text-sm font-medium">Produk tidak ditemukan</p>
      </div>
    )
  }
  return (
    <div className="flex-1 overflow-y-auto -mx-1 px-1">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 pb-4">
        {filtered.map(item => (
          <ProductCard
            key={item.id}
            item={item}
            inCart={cart.find(c => c.id === item.id)}
            onAdd={addToCart}
          />
        ))}
      </div>
    </div>
  )
}
