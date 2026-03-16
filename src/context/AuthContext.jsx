import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('pb_current_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  function getUsers() {
    try { return JSON.parse(localStorage.getItem('pb_users') || '[]') } catch { return [] }
  }

  function saveUsers(users) {
    localStorage.setItem('pb_users', JSON.stringify(users))
  }

  function refreshUser(userId) {
    const users = getUsers()
    const found = users.find(u => u.id === userId)
    if (!found) return
    const { password: _, ...safeUser } = found
    setUser(safeUser)
    localStorage.setItem('pb_current_user', JSON.stringify(safeUser))
  }

  function register({ name, email, password }) {
    const users = getUsers()
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'Un compte avec cet email existe déjà.' }
    }
    const newUser = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      password,
      seasonPassPaid: false,
      seasonPassType: null, // 'resident' | 'nonResident'
    }
    saveUsers([...users, newUser])
    const { password: _, ...safeUser } = newUser
    setUser(safeUser)
    localStorage.setItem('pb_current_user', JSON.stringify(safeUser))
    return { success: true }
  }

  function login({ email, password }) {
    const users = getUsers()
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!found) return { error: 'Email ou mot de passe incorrect.' }
    const { password: _, ...safeUser } = found
    setUser(safeUser)
    localStorage.setItem('pb_current_user', JSON.stringify(safeUser))
    return { success: true }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('pb_current_user')
  }

  // Mark seasonal pass as paid for current user (with optional resident code)
  function paySeasonPass(passType, residentCode = null) {
    if (!user) return
    const users = getUsers()
    const idx = users.findIndex(u => u.id === user.id)
    if (idx === -1) return
    users[idx].seasonPassPaid = true
    users[idx].seasonPassType = passType
    if (residentCode) users[idx].residentCode = residentCode.trim().toUpperCase()
    saveUsers(users)
    refreshUser(user.id)
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout, paySeasonPass }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
