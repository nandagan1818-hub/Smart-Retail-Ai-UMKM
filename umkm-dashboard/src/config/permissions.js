export const ROLE = {
  OWNER: 'owner',
  CASHIER: 'kasir',
}

const CASHIER_PAGES = new Set(['pos', 'settings'])

export function normalizeRole(role) {
  const normalized = String(role ?? '').toLowerCase()
  if (normalized === 'pemilik' || normalized === ROLE.OWNER) return ROLE.OWNER
  if (normalized === ROLE.CASHIER) return ROLE.CASHIER
  return null
}

export function canAccessPage(role, page) {
  const normalizedRole = normalizeRole(role)
  if (normalizedRole === ROLE.OWNER) return true
  return normalizedRole === ROLE.CASHIER && CASHIER_PAGES.has(page)
}

export function getHomePage(role) {
  return normalizeRole(role) === ROLE.CASHIER ? 'pos' : 'dashboard'
}
