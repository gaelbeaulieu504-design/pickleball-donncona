import 'dotenv/config'
import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const USERS_FILE = path.join(__dirname, 'data', 'users.json')
const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json')
const TOURNAMENTS_FILE = path.join(__dirname, 'data', 'tournaments.json')

function readBookings() {
  try {
    return JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8'))
  } catch {
    return []
  }
}

function writeBookings(bookings) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
}

function readTournaments() {
  try { return JSON.parse(fs.readFileSync(TOURNAMENTS_FILE, 'utf8')) }
  catch { return [] }
}
function writeTournaments(tournaments) {
  fs.writeFileSync(TOURNAMENTS_FILE, JSON.stringify(tournaments, null, 2))
}

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

// GET all bookings
app.get('/api/bookings', (req, res) => {
  res.json(readBookings())
})

// POST new booking
app.post('/api/bookings', (req, res) => {
  const bookings = readBookings()
  const booking = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() }
  bookings.push(booking)
  writeBookings(bookings)
  res.json({ success: true, booking })
})

// DELETE booking
app.delete('/api/bookings/:id', (req, res) => {
  const bookings = readBookings().filter(b => b.id !== req.params.id)
  writeBookings(bookings)
  res.json({ success: true })
})

// GET tournaments
app.get('/api/tournaments', (req, res) => {
  res.json(readTournaments())
})

// POST create tournament
app.post('/api/tournaments', (req, res) => {
  const { name, date, location, description, maxPlayers, price } = req.body
  if (!name || !date) return res.status(400).json({ error: 'Nom et date requis' })
  const tournaments = readTournaments()
  const newTournament = {
    id: Date.now().toString(),
    name,
    date,
    location: location || 'Terrains de pickleball Donnacona',
    description: description || '',
    maxPlayers: maxPlayers ? Number(maxPlayers) : null,
    price: price ? Number(price) : 0,
    registrations: [],
    createdAt: new Date().toISOString(),
  }
  tournaments.push(newTournament)
  writeTournaments(tournaments)
  res.json(newTournament)
})

// DELETE tournament
app.delete('/api/tournaments', (req, res) => {
  const { tournamentId } = req.body
  const updated = readTournaments().filter(t => t.id !== tournamentId)
  writeTournaments(updated)
  res.json({ success: true })
})

// POST register to tournament
app.post('/api/tournament-register', (req, res) => {
  const { tournamentId, userName, userEmail } = req.body
  if (!tournamentId || !userName || !userEmail) return res.status(400).json({ error: 'Paramètres manquants' })
  const tournaments = readTournaments()
  const idx = tournaments.findIndex(t => t.id === tournamentId)
  if (idx === -1) return res.status(404).json({ error: 'Tournoi introuvable' })
  const tournament = tournaments[idx]
  if (tournament.registrations.find(r => r.email === userEmail)) {
    return res.status(400).json({ error: 'Vous êtes déjà inscrit à ce tournoi' })
  }
  if (tournament.maxPlayers && tournament.registrations.length >= tournament.maxPlayers) {
    return res.status(400).json({ error: 'Ce tournoi est complet' })
  }
  tournament.registrations.push({ name: userName, email: userEmail, registeredAt: new Date().toISOString() })
  tournaments[idx] = tournament
  writeTournaments(tournaments)
  res.json({ success: true, tournament })
})

// POST create Stripe payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, description } = req.body
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Montant invalide.' })
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: 'cad',
      description: description || 'Inscription tournoi',
      automatic_payment_methods: { enabled: true },
    })
    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('Stripe error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST grant free pass
app.post('/api/grant-free-pass', (req, res) => {
  const { userId, grant } = req.body
  const users = readUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return res.status(404).json({ error: 'Utilisateur introuvable.' })
  users[idx].freePass = grant === true
  if (grant) {
    users[idx].seasonPassPaid = true
    users[idx].seasonPassType = users[idx].seasonPassType || 'resident'
  }
  writeUsers(users)
  const { password: _, ...safeUser } = users[idx]
  res.json({ success: true, user: safeUser })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`)
})
