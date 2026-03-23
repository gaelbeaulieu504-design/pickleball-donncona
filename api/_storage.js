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
  fs.writeFileSync(path.join(DATA, file), JSON.stringify(data, null, 2))
}

async function getKv() {
  if (process.env.KV_REST_API_URL) {
    const { kv } = await import('@vercel/kv')
    return kv
  }
  return null
}

export async function getUsers() {
  const kv = await getKv()
  if (kv) return (await kv.get('users')) || []
  return readJson('users.json')
}
export async function setUsers(users) {
  const kv = await getKv()
  if (kv) { await kv.set('users', users); return }
  writeJson('users.json', users)
}

export async function getBookings() {
  const kv = await getKv()
  if (kv) return (await kv.get('bookings')) || []
  return readJson('bookings.json')
}
export async function setBookings(bookings) {
  const kv = await getKv()
  if (kv) { await kv.set('bookings', bookings); return }
  writeJson('bookings.json', bookings)
}
