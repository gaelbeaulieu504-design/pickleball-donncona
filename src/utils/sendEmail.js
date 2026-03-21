import emailjs from '@emailjs/browser'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const configured =
  SERVICE_ID  && SERVICE_ID  !== 'YOUR_SERVICE_ID' &&
  TEMPLATE_ID && TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' &&
  PUBLIC_KEY  && PUBLIC_KEY  !== 'YOUR_PUBLIC_KEY'

const ADMIN_EMAIL = 'pickleballdonnacona@gmail.com'

export async function sendBookingConfirmation(params) {
  if (!configured) {
    console.warn('[EmailJS] Non configuré — email non envoyé pour:', params.to_email)
    return { success: false, notConfigured: true }
  }
  try {
    // 1. Confirmation au membre
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, PUBLIC_KEY)

    // 2. Copie à l'administrateur
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      ...params,
      to_name: 'Administrateur Pickleball Donnacona',
      to_email: ADMIN_EMAIL,
    }, PUBLIC_KEY)

    return { success: true }
  } catch (err) {
    console.error('[EmailJS] Erreur:', err)
    return { success: false, error: err }
  }
}

export async function sendBroadcast({ to_name, to_email, subject, message }) {
  if (!configured) {
    console.warn('[EmailJS] Non configuré — broadcast non envoyé pour:', to_email)
    return { success: false, notConfigured: true }
  }
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_name,
      to_email,
      subject,
      message,
      court: '',
      date: '',
      time_slot: '',
      duration: '',
      pass_type: '',
      amount_paid: '',
      week_hours: '',
    }, PUBLIC_KEY)
    return { success: true }
  } catch (err) {
    console.error('[EmailJS] Erreur broadcast:', err)
    return { success: false, error: err }
  }
}
