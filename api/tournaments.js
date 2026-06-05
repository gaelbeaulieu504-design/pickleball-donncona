// Helper: read tournaments from Vercel Edge Config
async function getTournaments() {
  const id = process.env.EDGE_CONFIG_ID
  const token = process.env.VERCEL_API_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID
  if (id && token) {
    const res = await fetch(
      `https://api.vercel.com/v1/edge-config/${id}/items?teamId=${teamId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await res.json()
    const item = (data.items || data || []).find(i => i.key === 'tournaments')
    return item ? item.value : []
  }
  // Local fallback
  const { getTournaments: getLocal } = await import('../server/_storage.js')
  return getLocal()
}

// Helper: write tournaments to Vercel Edge Config
async function saveTournaments(tournaments) {
  const id = process.env.EDGE_CONFIG_ID
  const token = process.env.VERCEL_API_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID
  if (id && token) {
    await fetch(
      `https://api.vercel.com/v1/edge-config/${id}/items?teamId=${teamId}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ operation: 'upsert', key: 'tournaments', value: tournaments }] }),
      }
    )
    return
  }
  // Local fallback
  const { setTournaments: setLocal } = await import('../server/_storage.js')
  await setLocal(tournaments)
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const tournaments = await getTournaments()
    return res.status(200).json(tournaments)
  }

  if (req.method === 'POST') {
    const { name, date, location, description, maxPlayers, price, categories } = req.body
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
      categories: categories || [],
      registrations: [],
      createdAt: new Date().toISOString(),
    }
    tournaments.push(newTournament)
    await saveTournaments(tournaments)
    return res.status(200).json(newTournament)
  }

  if (req.method === 'DELETE') {
    const { tournamentId } = req.body
    const tournaments = await getTournaments()
    await saveTournaments(tournaments.filter(t => t.id !== tournamentId))
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
