import { getTournaments, setTournaments } from './_storage.js'
import emailjs from '@emailjs/browser'

const SERVICE_ID  = process.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = process.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = process.env.VITE_EMAILJS_PUBLIC_KEY
const ADMIN_EMAIL = 'pickleballdonnacona@gmail.com'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { tournamentId, userName, userEmail } = req.body
  if (!tournamentId || !userName || !userEmail) {
    return res.status(400).json({ error: 'Paramètres manquants' })
  }

  const tournaments = await getTournaments()
  const idx = tournaments.findIndex(t => t.id === tournamentId)
  if (idx === -1) return res.status(404).json({ error: 'Tournoi introuvable' })

  const tournament = tournaments[idx]

  // Check if already registered
  if (tournament.registrations.find(r => r.email === userEmail)) {
    return res.status(400).json({ error: 'Vous êtes déjà inscrit à ce tournoi' })
  }

  // Check max players
  if (tournament.maxPlayers && tournament.registrations.length >= tournament.maxPlayers) {
    return res.status(400).json({ error: 'Ce tournoi est complet' })
  }

  // Add registration
  tournament.registrations.push({
    name: userName,
    email: userEmail,
    registeredAt: new Date().toISOString(),
  })
  tournaments[idx] = tournament
  await setTournaments(tournaments)

  // Send email to admin via EmailJS REST API
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
      console.error('[EmailJS] Erreur envoi email tournoi:', e)
    }
  }

  return res.status(200).json({ success: true, tournament })
}
