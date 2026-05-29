import { getUsers, setUsers } from './_storage.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { userId, grant } = req.body // grant: true = activer, false = révoquer
  const users = await getUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return res.status(404).json({ error: 'Utilisateur introuvable.' })
  users[idx].freePass = grant === true
  if (grant) {
    users[idx].seasonPassPaid = true
    users[idx].seasonPassType = users[idx].seasonPassType || 'resident'
  }
  await setUsers(users)
  const { password: _, ...safeUser } = users[idx]
  res.json({ success: true, user: safeUser })
}
