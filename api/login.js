import { getUsers } from '../server/_storage.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body
  const users = await getUsers()
  const emailNorm = email.trim().toLowerCase()
  const found = users.find(
    u => u.email.trim().toLowerCase() === emailNorm && u.password === password.trim()
  )
  if (!found) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' })
  const { password: _, ...safeUser } = found
  res.json({ success: true, user: safeUser })
}
