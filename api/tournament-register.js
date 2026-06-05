const ADMIN_EMAIL = 'pickleballdonnacona@gmail.com'

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
  const { getTournaments: getLocal } = await import('../server/_storage.js')
  return getLocal()
}

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
  const { setTournaments: setLocal } = await import('../server/_storage.js')
  await setLocal(tournaments)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { tournamentId, userName, userEmail, category } = req.body
  if (!tournamentId || !userName || !userEmail) {
    return res.status(400).json({ error: 'Paramètres manquants' })
  }

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
  await saveTournaments(tournaments)

  // Send email to admin via EmailJS REST
  const SERVICE_ID = process.env.VITE_EMAILJS_SERVICE_ID
  const TEMPLATE_ID = process.env.VITE_EMAILJS_TEMPLATE_ID
  const PUBLIC_KEY = process.env.VITE_EMAILJS_PUBLIC_KEY
  if (SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY) {
    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: SERVICE_ID,
          template_id: TEMPLATE_ID,
          user_id: PUBLIC_KEY,
          template_params: {
            to_name: 'Administrateur Pickleball Donnacona',
            to_email: ADMIN_EMAIL,
            subject: `Nouvelle inscription au tournoi : ${tournament.name}`,
            message: `${userName} (${userEmail}) s'est inscrit au tournoi "${tournament.name}" prévu le ${tournament.date}.\n\nTotal inscrits : ${tournament.registrations.length}${tournament.maxPlayers ? ' / ' + tournament.maxPlayers : ''}.`,
            court: tournament.name,
            date: tournament.date,
            time_slot: tournament.location,
            duration: '',
            pass_type: '',
            amount_paid: tournament.price ? `$${tournament.price}` : 'Gratuit',
            week_hours: '',
          }
        })
      })
    } catch (e) {
      console.error('[EmailJS] Erreur:', e)
    }
  }

  return res.status(200).json({ success: true, tournament })
}
