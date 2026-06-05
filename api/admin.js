import { getUsers, setUsers } from '../server/_storage.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { action, userId, active, passType } = req.body

  if (action === 'toggle-season-pass') {
    const users = await getUsers()
    const idx = users.findIndex(u => u.id === userId)
    if (idx === -1) return res.status(404).json({ error: 'Utilisateur introuvable.' })
    if (active) {
      users[idx].seasonPassPaid = true
      users[idx].seasonPassType = passType || 'resident'
      users[idx].passPaymentDate = users[idx].passPaymentDate || new Date().toISOString()
    } else {
      users[idx].seasonPassPaid = false
      users[idx].seasonPassType = null
      users[idx].passPaymentDate = null
    }
    await setUsers(users)
    const { password: _, ...safeUser } = users[idx]
    return res.json({ success: true, user: safeUser })
  }

  if (action === 'delete-user') {
    if (!userId) return res.status(400).json({ error: 'userId requis.' })
    let users = await getUsers()
    const idx = users.findIndex(u => u.id === userId)
    if (idx === -1) return res.status(404).json({ error: 'Utilisateur introuvable.' })
    if (users[idx].isAdmin) return res.status(403).json({ error: 'Impossible de supprimer un administrateur.' })
    users = users.filter(u => u.id !== userId)
    await setUsers(users)
    return res.json({ success: true })
  }

  res.status(400).json({ error: 'Action invalide.' })
}