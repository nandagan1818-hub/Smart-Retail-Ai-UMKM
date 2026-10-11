import { useState } from 'react'
import {
  Store, Printer, KeyRound, CheckCircle2, Eye, EyeOff,
} from 'lucide-react'
import { USERS } from '../config/auth'
import { ROLE } from '../config/permissions'

/* ─── helpers ── */
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

function Card({ icon: Icon, iconColor = 'text-blue-600', iconBg = 'bg-blue-50', title, subtitle, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* card header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={20} className={iconColor} />
        </div>
        <div>
          <p className="text-sm font-black text-gray-800">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {/* body */}
      <div className="px-6 py-5 space-y-5">
        {children}
      </div>
    </div>
  )
}

/* ─── SettingsPage ── */
export default function SettingsPage({ settings, onSave, currentUser }) {
  const isOwner = currentUser?.role === ROLE.OWNER
  const [storeName,    setStoreName]    = useState(settings.storeName ?? 'Smart Retail AI')
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress ?? '')
  const [printerName,  setPrinterName]  = useState(settings.printerName ?? '')
  const [printerWidth, setPrinterWidth] = useState(settings.printerWidth ?? '58mm')

  const [oldPass,   setOldPass]   = useState('')
  const [newPass,   setNewPass]   = useState('')
  const [newPass2,  setNewPass2]  = useState('')
  const [showOld,   setShowOld]   = useState(false)
  const [showNew,   setShowNew]   = useState(false)

  const [storeMsg,  setStoreMsg]  = useState(null)   // {ok, text}
  const [passMsg,   setPassMsg]   = useState(null)

  /* save store settings */
  function saveStore(e) {
    e.preventDefault()
    if (isOwner && !storeName.trim()) return
    onSave(isOwner
      ? { storeName: storeName.trim(), storeAddress: storeAddress.trim(), printerName: printerName.trim(), printerWidth }
      : { printerName: printerName.trim(), printerWidth })
    setStoreMsg({ ok: true, text: isOwner ? 'Pengaturan toko disimpan.' : 'Pengaturan printer disimpan.' })
    setTimeout(() => setStoreMsg(null), 3000)
  }

  /* change kasir password (client-side demo only) */
  function savePassword(e) {
    e.preventDefault()
    const kasir = USERS.find(u => u.username === 'kasir')
    if (!kasir) return
    if (oldPass !== kasir.password) {
      setPassMsg({ ok: false, text: 'Password lama tidak cocok.' })
      return
    }
    if (newPass.length < 6) {
      setPassMsg({ ok: false, text: 'Password baru minimal 6 karakter.' })
      return
    }
    if (newPass !== newPass2) {
      setPassMsg({ ok: false, text: 'Konfirmasi password tidak cocok.' })
      return
    }
    kasir.password = newPass   // mutate in-memory (demo only)
    setPassMsg({ ok: true, text: 'Password kasir berhasil diubah.' })
    setOldPass(''); setNewPass(''); setNewPass2('')
    setTimeout(() => setPassMsg(null), 4000)
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* ── Nama & Alamat Toko ── */}
      {isOwner && <Card
        icon={Store}
        iconColor="text-blue-600"
        iconBg="bg-blue-50"
        title="Informasi Toko"
        subtitle="Nama toko akan tampil di header struk"
      >
        <form onSubmit={saveStore} className="space-y-4">
          <Field label="Nama Toko">
            <input
              type="text"
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              maxLength={40}
              placeholder="contoh: Toko Bu Sari"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-semibold
                         focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </Field>
          <Field label="Alamat (opsional)">
            <input
              type="text"
              value={storeAddress}
              onChange={e => setStoreAddress(e.target.value)}
              maxLength={80}
              placeholder="contoh: Jl. Merdeka No. 12, Jakarta"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm
                         focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </Field>

          <SaveRow msg={storeMsg} />
        </form>
      </Card>}

      {/* ── Printer Bluetooth ── */}
      <Card
        icon={Printer}
        iconColor="text-violet-600"
        iconBg="bg-violet-50"
        title="Printer Struk"
        subtitle="Profil printer Bluetooth / thermal"
      >
        <form onSubmit={saveStore} className="space-y-4">
          <Field label="Nama Printer Bluetooth">
            <input
              type="text"
              value={printerName}
              onChange={e => setPrinterName(e.target.value)}
              placeholder="contoh: RPP02N, Epson TM-T82"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm
                         focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <p className="text-xs text-gray-400 mt-1">
              Pastikan printer sudah di-pair di pengaturan Bluetooth perangkat Anda.
            </p>
          </Field>

          <Field label="Lebar Kertas">
            <div className="flex gap-2">
              {['58mm', '80mm'].map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setPrinterWidth(w)}
                  className={[
                    'flex-1 py-3 rounded-2xl border-2 text-sm font-bold transition-all',
                    printerWidth === w
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-violet-300 hover:bg-violet-50',
                  ].join(' ')}
                >
                  {w}
                </button>
              ))}
            </div>
          </Field>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-700 font-medium">
              <span className="font-bold">Catatan:</span> Koneksi Bluetooth aktif saat menekan "Cetak Struk" pada
              halaman POS. Pastikan printer dalam jangkauan dan perangkat sudah terpasang.
            </p>
          </div>

          <SaveRow msg={storeMsg} />
        </form>
      </Card>

      {/* ── Ganti Password Kasir ── */}
      {isOwner && <Card
        icon={KeyRound}
        iconColor="text-emerald-600"
        iconBg="bg-emerald-50"
        title="Kata Sandi Kasir"
        subtitle="Hanya Pemilik yang dapat mengubah kata sandi kasir"
      >
        <form onSubmit={savePassword} className="space-y-4">
            <Field label="Password Lama Kasir">
              <PasswordInput
                value={oldPass}
                onChange={setOldPass}
                show={showOld}
                onToggle={() => setShowOld(s => !s)}
                placeholder="Password kasir saat ini"
              />
            </Field>
            <Field label="Password Baru">
              <PasswordInput
                value={newPass}
                onChange={setNewPass}
                show={showNew}
                onToggle={() => setShowNew(s => !s)}
                placeholder="Minimal 6 karakter"
              />
            </Field>
            <Field label="Konfirmasi Password Baru">
              <PasswordInput
                value={newPass2}
                onChange={setNewPass2}
                show={showNew}
                onToggle={() => setShowNew(s => !s)}
                placeholder="Ulangi password baru"
              />
            </Field>

            {passMsg && (
              <p className={`text-xs font-semibold px-1 ${passMsg.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                {passMsg.ok ? '✓ ' : '✗ '}{passMsg.text}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700
                         text-white text-sm font-black rounded-2xl transition-colors flex items-center
                         justify-center gap-2"
            >
              <KeyRound size={16} />
              Simpan Password Baru
            </button>
        </form>
      </Card>}
    </div>
  )
}

/* ─── tiny helpers ── */
function SaveRow({ msg }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="submit"
        className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                   text-white text-sm font-black rounded-2xl transition-colors
                   flex items-center justify-center gap-2"
      >
        <CheckCircle2 size={16} />
        Simpan Perubahan
      </button>
      {msg && (
        <span className={`text-xs font-semibold ${msg.ok ? 'text-emerald-600' : 'text-red-500'}`}>
          {msg.ok ? '✓' : '✗'} {msg.text}
        </span>
      )}
    </div>
  )
}

function PasswordInput({ value, onChange, show, onToggle, placeholder }) {
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 pr-11 border-2 border-gray-200 rounded-2xl text-sm
                   focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}
