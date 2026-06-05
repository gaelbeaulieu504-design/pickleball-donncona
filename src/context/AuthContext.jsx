import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const API = '/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('pb_current_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  function saveSession(u) {
    setUser(u)
    localStorage.setItem('pb_current_user', JSON.stringify(u))
  }

  function getAllUsers() {
    // utilisé par AdminPanel — retourne une promesse
    return fetch(`${API}/users`).then(r => r.json()).then(users => users.filter(u => !u.isAdmin))
  }

  async function register({ name, email, password, address, isResident }) {
    try {
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, address, isResident }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error }
      saveSession(data.user)
      return { success: true }
    } catch {
      return { error: 'Erreur de connexion au serveur.' }
    }
  }

  async function login({ email, password }) {
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error }
      saveSession(data.user)
      return { success: true }
    } catch {
      return { error: 'Erreur de connexion au serveur.' }
    }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('pb_current_user')
  }

  async function grantFreePass(userId, grant) {
    try {
      const res = await fetch(`${API}/grant-free-pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, grant }),
      })
      return res.ok
    } catch { return false }
  }

  async function toggleSeasonPass(userId, active, passType) {
    try {
      const res = await fetch(`${API}/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-season-pass', userId, active, passType }),
      })
      if (!res.ok) return false
      const data = await res.json()
      return data.success ? data.user : false
    } catch { return false }
  }

  async function deleteUser(userId) {
    try {
      const res = await fetch(`${API}/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-user', userId }),
      })
      return res.ok
    } catch { return false }
  }

  async function paySeasonPass(passType) {
    if (!user) return
    try {
      const res = await fetch(`${API}/season-pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, passType }),
      })
      const data = await res.json()
      if (res.ok) saveSession(data.user)
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout, paySeasonPass, getAllUsers, grantFreePass, toggleSeasonPass, deleteUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
