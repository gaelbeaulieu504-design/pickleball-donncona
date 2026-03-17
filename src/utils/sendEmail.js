import emailjs from '@emailjs/browser'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const configured =
  SERVICE_ID  && SERVICE_ID  !== 'YOUR_SERVICE_ID' &&
  TEMPLATE_ID && TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' &&
  PUBLIC_KEY  && PUBLIC_KEY  !== 'YOUR_PUBLIC_KEY'

/**
 * Send a booking confirmation email.
 * Returns { success: true } or { success: false, error }
 *
 * Template variables expected in EmailJS:
 *   {{to_name}}       — member's name
 *   {{to_email}}      — member's email
 *   {{court}}         — "Terrain 2"
 *   {{date}}          — "mercredi 18 mars 2026"
 *   {{time_slot}}     — "10h00 – 12h00"
 *   {{duration}}      — "2 heures"
 *   {{pass_type}}     — "Résident ($30)" or "Non-résident ($50)"
 *   {{amount_paid}}   — "$30" or "$0 (déjà payé)"
 *   {{week_hours}}    — "4h / 6h"
 */
export async function sendBookingConfirmation(params) {
  if (!configured) {
    console.warn('[EmailJS] Non configuré — email simulé pour:', params.to_email)
    return { success: false, notConfigured: true }
  }
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, PUBLIC_KEY)
    return { success: true }
  } catch (err) {
    console.error('[EmailJS] Erreur:', err)
    return { success: false, error: err }
  }
}
