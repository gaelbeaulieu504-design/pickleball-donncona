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
    const emailNorm = email.trim().toLowerCase()
    if (users.find(u => u.email.trim().toLowerCase() === emailNorm)) {
      return { error: 'Un compte avec cet email existe déjà.' }
    }
    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: emailNorm,
      password: password.trim(),
      seasonPassPaid: false,
      seasonPassType: null,
    }
    saveUsers([...users, newUser])
    const { password: _, ...safeUser } = newUser
    setUser(safeUser)
    localStorage.setItem('pb_current_user', JSON.stringify(safeUser))
    return { success: true }
  }

  function login({ email, password }) {
    const users = getUsers()
    const emailNorm = email.trim().toLowerCase()
    const passwordTrim = password.trim()
    const found = users.find(
      u => u.email.trim().toLowerCase() === emailNorm && u.password === passwordTrim
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

  // Mark seasonal pass as paid for current user
  function paySeasonPass(passType) {
    if (!user) return
    const users = getUsers()
    const idx = users.findIndex(u => u.id === user.id)
    if (idx === -1) return
    users[idx].seasonPassPaid = true
    users[idx].seasonPassType = passType
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
