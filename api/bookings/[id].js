import { getBookings, setBookings } from '../_storage.js'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end()
  const bookings = (await getBookings()).filter(b => b.id !== req.query.id)
  await setBookings(bookings)
  res.json({ success: true })
}
