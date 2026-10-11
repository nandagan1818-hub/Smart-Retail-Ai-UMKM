import { useState } from 'react'
import { USERS, SESSION_KEY } from '../config/auth'
import { normalizeRole } from '../config/permissions'

function normalizeUser(user) {
  const role = normalizeRole(user?.role)
  if (!role || !user?.username || !user?.name) return null
  return { username: user.username, name: user.name, role }
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      return saved ? normalizeUser(JSON.parse(saved)) : null
    } catch {
      return null
    }
  })

  function login(username, password) {
    const found = USERS.find(
      u => u.username === username.trim() && u.password === password
    )
    if (!found) return false
    const session = normalizeUser(found)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setCurrentUser(session)
    return session
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setCurrentUser(null)
  }

  return { currentUser, login, logout }
}
