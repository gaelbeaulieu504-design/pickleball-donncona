import emailjs from '@emailjs/browser'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const configured =
  SERVICE_ID  && SERVICE_ID  !== 'YOUR_SERVICE_ID' &&
  TEMPLATE_ID && TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' &&
  PUBLIC_KEY  && PUBLIC_KEY  !== 'YOUR_PUBLIC_KEY'

export async function sendBookingConfirmation(params) {
  if (!configured) {
    console.warn('[EmailJS] Non configuré — email non envoyé pour:', params.to_email)
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
