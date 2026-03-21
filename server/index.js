import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const USERS_FILE = path.join(__dirname, 'data', 'users.json')

const app = express()
app.use(cors())
app.use(express.json())

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
  } catch {
    return []
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

// GET all users (admin only — filtré côté client)
app.get('/api/users', (req, res) => {
  const users = readUsers().map(({ password, ...u }) => u)
  res.json(users)
})

// POST register
app.post('/api/register', (req, res) => {
  const { name, email, password, address, isResident } = req.body
  const users = readUsers()
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

  writeUsers([...users, newUser])
  const { password: _, ...safeUser } = newUser
  res.json({ success: true, user: safeUser })
})

// POST login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body
  const users = readUsers()
  const emailNorm = email.trim().toLowerCase()
  const found = users.find(
    u => u.email.trim().toLowerCase() === emailNorm && u.password === password.trim()
  )
  if (!found) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' })
  const { password: _, ...safeUser } = found
  res.json({ success: true, user: safeUser })
})

// POST season pass
app.post('/api/season-pass', (req, res) => {
  const { userId, passType } = req.body
  const users = readUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return res.status(404).json({ error: 'Utilisateur introuvable.' })
  users[idx].seasonPassPaid = true
  users[idx].seasonPassType = passType
  writeUsers(users)
  const { password: _, ...safeUser } = users[idx]
  res.json({ success: true, user: safeUser })
})

// GET single user
app.get('/api/users/:id', (req, res) => {
  const users = readUsers()
  const found = users.find(u => u.id === req.params.id)
  if (!found) return res.status(404).json({ error: 'Introuvable.' })
  const { password: _, ...safeUser } = found
  res.json(safeUser)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`)
})
