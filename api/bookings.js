import { getBookings, setBookings } from '../server/_storage.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.json(await getBookings())
  } else if (req.method === 'POST') {
    const bookings = await getBookings()
    const booking = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() }
    bookings.push(booking)
    await setBookings(bookings)
    res.json({ success: true, booking })
  } else {
    res.status(405).end()
  }
}
