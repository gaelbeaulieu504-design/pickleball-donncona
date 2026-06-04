import { getUsers, setUsers } from './_storage.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { userId, active, passType } = req.body // active: true = activer, false = désactiver
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
  res.json({ success: true, user: safeUser })
}