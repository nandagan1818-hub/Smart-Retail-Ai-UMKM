import { useState } from 'react'
import { ShoppingBag, Eye, EyeOff, LogIn, Lock, User } from 'lucide-react'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username || !password) {
      setError('Username dan password wajib diisi.')
      return
    }
    setLoading(true)
    setError('')
    // simulasi delay network kecil
    await new Promise(r => setTimeout(r, 600))
    const ok = onLogin(username, password)
    if (!ok) {
      setError('Username atau password salah.')
    }
    setLoading(false)
  }

  const DEMO_USERS = [
    { username: 'kasir',   password: 'kasir123',   role: 'Kasir'   },
    { username: 'pemilik', password: 'pemilik123', role: 'Pemilik' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-blue-600 px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-4">
              <ShoppingBag size={28} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Smart Retail AI</h1>
            <p className="text-blue-200 text-sm mt-1">Dashboard Inventaris UMKM</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-base font-semibold text-gray-800 mb-1">Masuk ke Dashboard</h2>
            <p className="text-xs text-gray-400 mb-6">Masukkan kredensial Anda untuk melanjutkan</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Username</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError('') }}
                    placeholder="Masukkan username"
                    autoComplete="username"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <span className="text-red-500 text-xs">⚠️</span>
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm mt-2"
              >
                {loading
                  ? <><span className="animate-spin text-base">⏳</span> Memverifikasi...</>
                  : <><LogIn size={16} /> Masuk</>
                }
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Akun Demo</p>
              <div className="space-y-2">
                {DEMO_USERS.map(u => (
                  <button
                    key={u.username}
                    type="button"
                    onClick={() => { setUsername(u.username); setPassword(u.password); setError('') }}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl transition-all text-left"
                  >
                    <div>
                      <span className="text-xs font-semibold text-gray-700">{u.username}</span>
                      <span className="text-xs text-gray-400 ml-2">— {u.role}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">••••••••</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">Klik akun untuk mengisi otomatis</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-4">© 2026 Smart Retail AI · Sistem Inventaris UMKM</p>
      </div>
    </div>
  )
}
