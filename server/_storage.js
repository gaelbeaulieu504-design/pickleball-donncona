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

// ═══════════════════════════════════════════════════════════════════════════════
//  BACKUP SYSTEM — saves a snapshot before each write so data can be restored
// ═══════════════════════════════════════════════════════════════════════════════

async function backupBeforeWrite(key, value) {
  // Save the CURRENT data (before overwrite) as a backup
  const current = await edgeGet(key)
  if (current !== null) {
    await edgeSet(`backup_${key}`, current)
  }
}

// ── Full data export ─────────────────────────────────────────────────────────
export async function exportAllData() {
  const data = {}
  const useEdgeConfig = useEdge()
  for (const key of ['users', 'tournaments', 'bookings', 'courses']) {
    let val
    if (useEdgeConfig) {
      val = await edgeGet(key)
    }
    if (val === null || val === undefined) {
      try { val = readJson(`${key}.json`) } catch { val = null }
    }
    if (val !== null) data[key] = val
  }
  return data
}

// ── Full data import ─────────────────────────────────────────────────────────
export async function importAllData(data) {
  const results = {}
  for (const key of Object.keys(data)) {
    if (['users', 'tournaments', 'bookings', 'courses'].includes(key)) {
      results[key] = await edgeSet(key, data[key])
    }
  }
  return results
}

// ── Restore a single key from backup ─────────────────────────────────────────
export async function restoreFromBackup(key) {
  const backup = await edgeGet(`backup_${key}`)
  if (backup === null) return false
  return await edgeSet(key, backup)
}

// ── List available backups ───────────────────────────────────────────────────
export async function listBackups() {
  const id = process.env.EDGE_CONFIG_ID
  const token = process.env.VERCEL_API_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID
  if (!id || !token) return []
  try {
    const res = await fetch(
      `https://api.vercel.com/v1/edge-config/${id}/items?teamId=${teamId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await res.json()
    const items = data.items || data || []
    return items
      .filter(i => i.key.startsWith('backup_'))
      .map(i => ({ key: i.key.replace('backup_', ''), size: JSON.stringify(i.value).length }))
  } catch { return [] }
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
  if (useEdge()) {
    await backupBeforeWrite('users', users)
    await edgeSet('users', users)
    return
  }
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
  if (useEdge()) {
    await backupBeforeWrite('bookings', bookings)
    await edgeSet('bookings', bookings)
    return
  }
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
  if (useEdge()) {
    await backupBeforeWrite('tournaments', tournaments)
    await edgeSet('tournaments', tournaments)
    return
  }
  writeJson('tournaments.json', tournaments)
}

// ── Courses ───────────────────────────────────────────────────────────────────
const DEFAULT_COURSES = [
  {
    id: 'initiation-pickleball-ete-2026',
    name: 'Initiation au pickleball',
    dates: ['2026-06-20', '2026-06-27'],
    time: '9h00 – 11h00',
    price: 45,
    description: 'Cours d\'initiation au pickleball pour débutants sur 2 séances. Apprenez les règles, les techniques de base et amusez-vous en compagnie d\'autres joueurs. Équipement fourni.',
    maxParticipants: 8,
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
  if (useEdge()) {
    await backupBeforeWrite('courses', courses)
    await edgeSet('courses', courses)
    return
  }
  writeJson('courses.json', courses)
}