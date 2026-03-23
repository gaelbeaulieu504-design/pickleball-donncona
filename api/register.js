import { getUsers, setUsers } from './_storage.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { name, email, password, address, isResident } = req.body
  const users = await getUsers()
  const emailNorm = email.trim().toLowerCase()
  if (users.find(u => u.email.trim().toLowerCase() === emailNorm)) {
    return res.status(400).json({ error: 'Un compte avec cet email existe déjà.' })
  }
  const newUser = {
    id: Date.now().toString(),
    name: name.trim(),
    email: emailNorm,
    password: password.trim(),
    address: address || '',
    isResident: isResident ?? null,
    seasonPassPaid: false,
    seasonPassType: null,
    isAdmin: false,
  }
  await setUsers([...users, newUser])
  const { password: _, ...safeUser } = newUser
  res.json({ success: true, user: safeUser })
}
