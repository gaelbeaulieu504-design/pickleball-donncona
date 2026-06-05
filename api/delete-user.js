import { getUsers, setUsers } from './_storage.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { userId } = req.body
  if (!userId) return res.status(400).json({ error: 'userId requis.' })
  let users = await getUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return res.status(404).json({ error: 'Utilisateur introuvable.' })
  if (users[idx].isAdmin) return res.status(403).json({ error: 'Impossible de supprimer un administrateur.' })
  users = users.filter(u => u.id !== userId)
  await setUsers(users)
  res.json({ success: true })
}