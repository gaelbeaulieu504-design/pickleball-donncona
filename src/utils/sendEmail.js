const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY
const configured = ACCESS_KEY && ACCESS_KEY !== 'YOUR_WEB3FORMS_KEY'

/**
 * Send a booking confirmation email via Web3Forms (free, no template needed).
 * Setup: go to https://web3forms.com, enter your email, get a key in 30 seconds.
 */
export async function sendBookingConfirmation(params) {
  if (!configured) {
    console.warn('[Web3Forms] Non configuré — email non envoyé pour:', params.to_email)
    return { success: false, notConfigured: true }
  }

  const body = `
Bonjour ${params.to_name},

Votre réservation de terrain de pickleball est confirmée !

📍 Terrain : ${params.court}
📅 Date    : ${params.date}
⏰ Heure   : ${params.time_slot}
⏱ Durée   : ${params.duration}
🎫 Passe   : ${params.pass_type}
💳 Payé    : ${params.amount_paid}
📊 Quota   : ${params.week_hours} cette semaine

Merci et bonne partie !
— Pickleball Donnacona
  `.trim()

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: `✅ Réservation confirmée — ${params.court} le ${params.date}`,
        from_name: 'Pickleball Donnacona',
        email: params.to_email,
        message: body,
        replyto: params.to_email,
      }),
    })
    const data = await res.json()
    if (data.success) return { success: true }
    return { success: false, error: data.message }
  } catch (err) {
    console.error('[Web3Forms] Erreur:', err)
    return { success: false, error: err }
  }
}
