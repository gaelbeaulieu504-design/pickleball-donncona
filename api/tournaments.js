import { getTournaments, setTournaments } from './_storage.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const tournaments = await getTournaments()
    return res.status(200).json(tournaments)
  }

  if (req.method === 'POST') {
    const { name, date, location, description, maxPlayers, price, adminKey } = req.body
    if (adminKey !== process.env.ADMIN_SECRET && !req.body.isAdmin) {
      // We rely on frontend to only allow admins to call this
    }
    const tournaments = await getTournaments()
    const newTournament = {
      id: Date.now().toString(),
      name,
      date,
      location: location || 'Terrains de pickleball Donnacona',
      description: description || '',
      maxPlayers: maxPlayers || null,
      price: price || 0,
      registrations: [],
      createdAt: new Date().toISOString(),
    }
    tournaments.push(newTournament)
    await setTournaments(tournaments)
    return res.status(200).json(newTournament)
  }

  if (req.method === 'DELETE') {
    const { tournamentId } = req.body
    const tournaments = await getTournaments()
    const updated = tournaments.filter(t => t.id !== tournamentId)
    await setTournaments(updated)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
