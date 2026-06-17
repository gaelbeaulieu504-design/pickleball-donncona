import 'dotenv/config'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import Stripe from 'stripe'
import { getUsers, setUsers, getBookings, setBookings, getTournaments, setTournaments, getCourses, setCourses, exportAllData, restoreFromBackup, listBackups } from './_storage.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '..', 'dist')))

// ── Users ─────────────────────────────────────────────────────────────────────

// GET all users (admin only — filtré côté client)
app.get('/api/users', async (req, res) => {
  const users = (await getUsers()).map(({ password, ...u }) => u)
  res.json(users)
})

// POST register
app.post('/api/register', async (req, res) => {
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
})

// POST login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  const users = await getUsers()
  const emailNorm = email.trim().toLowerCase()
  const found = users.find(
    u => u.email.trim().toLowerCase() === emailNorm && u.password === password.trim()
  )
  if (!found) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' })
  const { password: _, ...safeUser } = found
  res.json({ success: true, user: safeUser })
})

// POST season pass
app.post('/api/season-pass', async (req, res) => {
  const { userId, passType } = req.body
  const users = await getUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return res.status(404).json({ error: 'Utilisateur introuvable.' })
  users[idx].seasonPassPaid = true
  users[idx].seasonPassType = passType
  users[idx].passPaymentDate = new Date().toISOString()
  await setUsers(users)
  const { password: _, ...safeUser } = users[idx]
  res.json({ success: true, user: safeUser })
})

// GET single user
app.get('/api/users/:id', async (req, res) => {
  const users = await getUsers()
  const found = users.find(u => u.id === req.params.id)
  if (!found) return res.status(404).json({ error: 'Introuvable.' })
  const { password: _, ...safeUser } = found
  res.json(safeUser)
})

// POST grant free pass
app.post('/api/grant-free-pass', async (req, res) => {
  const { userId, grant } = req.body
  const users = await getUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return res.status(404).json({ error: 'Utilisateur introuvable.' })
  users[idx].freePass = grant === true
  if (grant) {
    users[idx].seasonPassPaid = true
    users[idx].seasonPassType = users[idx].seasonPassType || 'resident'
    users[idx].passPaymentDate = users[idx].passPaymentDate || new Date().toISOString()
    users[idx].freePassGrantedDate = new Date().toISOString()
  } else {
    users[idx].seasonPassPaid = false
    users[idx].seasonPassType = null
    users[idx].freePassGrantedDate = null
  }
  await setUsers(users)
  const { password: _, ...safeUser } = users[idx]
  res.json({ success: true, user: safeUser })
})

// POST admin actions (toggle-season-pass, delete-user)
app.post('/api/admin', async (req, res) => {
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
})

// ── Bookings ──────────────────────────────────────────────────────────────────

// GET all bookings
app.get('/api/bookings', async (req, res) => {
  res.json(await getBookings())
})

// POST new booking
app.post('/api/bookings', async (req, res) => {
  const bookings = await getBookings()
  const booking = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() }
  bookings.push(booking)
  await setBookings(bookings)
  res.json({ success: true, booking })
})

// DELETE booking
app.delete('/api/bookings/:id', async (req, res) => {
  const bookings = (await getBookings()).filter(b => b.id !== req.params.id)
  await setBookings(bookings)
  res.json({ success: true })
})

// ── Tournaments ───────────────────────────────────────────────────────────────

// GET tournaments
app.get('/api/tournaments', async (req, res) => {
  res.json(await getTournaments())
})

// POST create tournament
app.post('/api/tournaments', async (req, res) => {
  const { name, date, location, description, maxPlayers, price } = req.body
  if (!name || !date) return res.status(400).json({ error: 'Nom et date requis' })
  const tournaments = await getTournaments()
  const newTournament = {
    id: Date.now().toString(),
    name,
    date,
    location: location || 'Terrains de pickleball Donnacona',
    description: description || '',
    maxPlayers: maxPlayers ? Number(maxPlayers) : null,
    price: price ? Number(price) : 0,
    categories: req.body.categories || [],
    registrations: [],
    createdAt: new Date().toISOString(),
  }
  tournaments.push(newTournament)
  await setTournaments(tournaments)
  res.json(newTournament)
})

// DELETE tournament
app.delete('/api/tournaments', async (req, res) => {
  const { tournamentId } = req.body
  const updated = (await getTournaments()).filter(t => t.id !== tournamentId)
  await setTournaments(updated)
  res.json({ success: true })
})

// PUT update tournament
app.put('/api/tournaments', async (req, res) => {
  const { id, name, date, location, description, maxPlayers, price, categories } = req.body
  if (!id || !name || !date) return res.status(400).json({ error: 'ID, nom et date requis' })
  const tournaments = await getTournaments()
  const idx = tournaments.findIndex(t => t.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Tournoi introuvable' })
  tournaments[idx] = {
    ...tournaments[idx],
    name,
    date,
    location: location || 'Terrains de pickleball Donnacona',
    description: description || '',
    maxPlayers: maxPlayers ? Number(maxPlayers) : null,
    price: price ? Number(price) : 0,
    categories: categories || [],
  }
  await setTournaments(tournaments)
  res.json(tournaments[idx])
})

// POST register to tournament
app.post('/api/tournament-register', async (req, res) => {
  const { tournamentId, userName, userEmail, category } = req.body
  if (!tournamentId || !userName || !userEmail) return res.status(400).json({ error: 'Paramètres manquants' })
  const tournaments = await getTournaments()
  const idx = tournaments.findIndex(t => t.id === tournamentId)
  if (idx === -1) return res.status(404).json({ error: 'Tournoi introuvable' })
  const tournament = tournaments[idx]
  if (tournament.registrations.find(r => r.email === userEmail)) {
    return res.status(400).json({ error: 'Vous êtes déjà inscrit à ce tournoi' })
  }
  if (tournament.maxPlayers && tournament.registrations.length >= tournament.maxPlayers) {
    return res.status(400).json({ error: 'Ce tournoi est complet' })
  }
  tournament.registrations.push({ name: userName, email: userEmail, category: category || null, registeredAt: new Date().toISOString() })
  tournaments[idx] = tournament
  await setTournaments(tournaments)
  res.json({ success: true, tournament })
})

// ── Stripe ────────────────────────────────────────────────────────────────────

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

// ── Courses ───────────────────────────────────────────────────────────────────

app.get('/api/courses', async (req, res) => res.json(await getCourses()))

app.post('/api/courses', async (req, res) => {
  const { courseId, userName, userEmail, userId, paymentInfo } = req.body
  if (!courseId || !userName || !userEmail) return res.status(400).json({ error: 'Paramètres manquants' })
  const courses = await getCourses()
  const idx = courses.findIndex(c => c.id === courseId)
  if (idx === -1) return res.status(404).json({ error: 'Cours introuvable' })
  const course = courses[idx]
  if (course.registrations.find(r => r.email === userEmail)) return res.status(400).json({ error: 'Vous êtes déjà inscrit à ce cours' })
  if (course.maxParticipants && course.registrations.length >= course.maxParticipants) return res.status(400).json({ error: 'Ce cours est complet' })
  course.registrations.push({ userId: userId || null, name: userName, email: userEmail, registeredAt: new Date().toISOString(), paymentInfo: paymentInfo || null })
  courses[idx] = course
  await setCourses(courses)
  res.json({ success: true, course })
})

// ── Backup / Restore (admin) ─────────────────────────────────────────────────

// GET /api/backup — export all data as JSON
app.get('/api/backup', async (req, res) => {
  const data = await exportAllData()
  res.setHeader('Content-Disposition', `attachment; filename="pickleball-backup-${new Date().toISOString().slice(0, 10)}.json"`)
  res.json(data)
})

// POST /api/backup — restore or list backups
app.post('/api/backup', async (req, res) => {
  const { action, key } = req.body || {}
  if (action === 'restore' && key) {
    const ok = await restoreFromBackup(key)
    return res.json({ success: ok, message: ok ? `${key} restauré depuis le backup` : `Aucun backup trouvé pour ${key}` })
  }
  if (action === 'list') {
    const backups = await listBackups()
    return res.json({ success: true, backups })
  }
  res.status(400).json({ error: 'Action invalide. Utilisez action=restore&key=X ou action=list' })
})

// ── SPA fallback ──────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
})

// Démarrer le serveur localement (sur Vercel, c'est géré automatiquement)
if (!process.env.VERCEL) {
  const PORT = 3001
  app.listen(PORT, () => {
    console.log(`✅ API server running on http://localhost:${PORT}`)
  })
}

export default app