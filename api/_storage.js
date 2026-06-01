import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA = path.join(__dirname, '../server/data')

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8')) }
  catch { return [] }
}
function writeJson(file, data) {
  try { fs.writeFileSync(path.join(DATA, file), JSON.stringify(data, null, 2)) }
  catch { /* read-only filesystem on Vercel */ }
}

// ── Edge Config helpers ──────────────────────────────────────────────────────
async function edgeGet(key) {
  const id = process.env.EDGE_CONFIG_ID
  const token = process.env.VERCEL_API_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID
  if (!id || !token) return null
  try {
    const url = `https://api.vercel.com/v1/edge-config/${id}/items?teamId=${teamId}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    const items = data.items || data || []
    const item = items.find(i => i.key === key)
    return item ? item.value : null
  } catch { return null }
}

async function edgeSet(key, value) {
  const id = process.env.EDGE_CONFIG_ID
  const token = process.env.VERCEL_API_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID
  if (!id || !token) return false
  try {
    const url = `https://api.vercel.com/v1/edge-config/${id}/items?teamId=${teamId}`
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ operation: 'upsert', key, value }] }),
    })
    return res.ok
  } catch { return false }
}

const useEdge = () => !!(process.env.EDGE_CONFIG_ID && process.env.VERCEL_API_TOKEN)

// ── Users ────────────────────────────────────────────────────────────────────
export async function getUsers() {
  if (useEdge()) {
    const val = await edgeGet('users')
    // Fallback: if Edge Config has no users yet, return the bundled file data
    if (val !== null) return val
  }
  return readJson('users.json')
}
export async function setUsers(users) {
  if (useEdge()) { await edgeSet('users', users); return }
  writeJson('users.json', users)
}

// ── Bookings ─────────────────────────────────────────────────────────────────
export async function getBookings() {
  if (useEdge()) {
    const val = await edgeGet('bookings')
    if (val !== null) return val
  }
  return readJson('bookings.json')
}
export async function setBookings(bookings) {
  if (useEdge()) { await edgeSet('bookings', bookings); return }
  writeJson('bookings.json', bookings)
}

// ── Tournaments ──────────────────────────────────────────────────────────────
export async function getTournaments() {
  if (useEdge()) {
    const val = await edgeGet('tournaments')
    if (val !== null) return val
  }
  return readJson('tournaments.json')
}
export async function setTournaments(tournaments) {
  if (useEdge()) { await edgeSet('tournaments', tournaments); return }
  writeJson('tournaments.json', tournaments)
}

// ── Courses ───────────────────────────────────────────────────────────────────
const DEFAULT_COURSES = [
  {
    id: 'cours-20-juin-2026',
    name: 'Initiation au pickleball',
    date: '2026-06-20',
    time: '9h00 – 11h00',
    price: 45,
    description: 'Cours d\'initiation au pickleball pour débutants. Apprenez les règles, les techniques de base et amusez-vous en compagnie d\'autres joueurs. Équipement fourni.',
    maxParticipants: 16,
    registrations: [],
  },
  {
    id: 'cours-27-juin-2026',
    name: 'Initiation au pickleball',
    date: '2026-06-27',
    time: '9h00 – 11h00',
    price: 45,
    description: 'Cours d\'initiation au pickleball pour débutants. Apprenez les règles, les techniques de base et amusez-vous en compagnie d\'autres joueurs. Équipement fourni.',
    maxParticipants: 16,
    registrations: [],
  },
]
export async function getCourses() {
  if (useEdge()) {
    const val = await edgeGet('courses')
    if (val !== null) return val
  }
  const stored = readJson('courses.json')
  return stored.length ? stored : DEFAULT_COURSES
}
export async function setCourses(courses) {
  if (useEdge()) { await edgeSet('courses', courses); return }
  writeJson('courses.json', courses)
}
