import { getUsers } from '../_storage.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const users = await getUsers()
  const found = users.find(u => u.id === req.query.id)
  if (!found) return res.status(404).json({ error: 'Introuvable.' })
  const { password: _, ...safeUser } = found
  res.json(safeUser)
}
